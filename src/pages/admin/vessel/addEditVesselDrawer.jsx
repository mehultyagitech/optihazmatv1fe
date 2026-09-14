import React, { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  TextField,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRecoilState } from "recoil";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import vesselSchema from "../../../validations/Vessel";
import useVessel from "../../../api/services/useVessel";
import { vesselState } from "../../../utils/States/Vessel";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import {
  DocumentTypeSelector,
  defaultDocumentTypeSelector,
  ClientSelector,
  ManagerSelector,
} from "../../../utils/States/Generic";
import { useQueryClient } from "@tanstack/react-query";

const AddEditVesselDrawer = ({ onClose }) => {
  const [vessel, setVessel] = useRecoilState(vesselState);
  const vesselId = vessel.id;

  const documentTypes = useRecoilValue(DocumentTypeSelector);
  const defaultDocumentType = useRecoilValue(defaultDocumentTypeSelector);
  const clients = useRecoilValue(ClientSelector);
  const managers = useRecoilValue(ManagerSelector);

  const { getVesselById, createVessel, updateVessel } = useVessel();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabIndex, setTabIndex] = useState(0);
  const [surveySameAsStart, setSurveySameAsStart] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [image, setImage] = useState();
  const [commonInventoryImage, setCommonInventoryImage] = useState();
  const vesselMutation = vesselId ? updateVessel() : createVessel();
  const queryClient = useQueryClient();

  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const [statusHistoryData, setStatusHistoryData] = useState([]);

  // Created/updated info for the footer, filled from the loaded vessel.
  const [audit, setAudit] = useState(null);

  // Status when the vessel loaded: remarks are required only when it is
  // being discontinued now, not on every edit of an already-discontinued one.
  const [wasDiscontinued, setWasDiscontinued] = useState(false);

  // "25-Nov-2020". Built by hand: en-GB toLocaleDateString now writes "Sept".
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatAuditDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getDate()).padStart(2, "0")}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
  };
  const auditUserName = (user) => user?.name || user?.email || null;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: joiResolver(vesselSchema),
    defaultValues: {},
    // Read by the Joi rule as $wasDiscontinued.
    context: { wasDiscontinued },
  });

  // Discontinue Remarks is mandatory only while this is ticked.
  const isDiscontinued = !!watch("discontinued");

  // Ready For Maintenance Date is locked (read-only) once the box is ticked.
  const isReadyForMaintenance = !!watch("readyForMaintenance");

  // IHM Survey End Date is mandatory and validation runs before onSubmit
  // copies the start date across, so while "Same as Survey End Dt" is ticked
  // keep the end date equal to the start date in the form itself.
  const ihmSurveyStart = watch("ihmSurveyStartDate");
  useEffect(() => {
    if (surveySameAsStart) setValue("ihmSurveyEndDate", ihmSurveyStart ?? "");
  }, [surveySameAsStart, ihmSurveyStart, setValue]);

  const { data: vesselData, isLoading: isLoadingVessel } =
    getVesselById(vesselId);

  const getFileObjectURL = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return import.meta.env.VITE_API_URL + "/uploads/" + file.url;
  };

  useEffect(() => {
    if (vesselData && vesselId && !isLoadingVessel) {
      const {
        VesselImages,
        VesselAttachments,
        VesselHistory,
        VesselInventoryImages,
        // Display-only audit fields: kept out of the form so neither Joi nor
        // the save payload ever sees them.
        createdAt,
        updatedAt,
        createdByUser,
        updatedByUser,
        ...restVesselData
      } = vesselData;

      setAudit({ createdAt, updatedAt, createdByUser, updatedByUser });
      setWasDiscontinued(!!restVesselData.discontinued);

      Object.keys(restVesselData).forEach((key) => {
        if (key.endsWith("Date") && restVesselData[key]) {
          restVesselData[key] = new Date(restVesselData[key])
            .toISOString()
            .split("T")[0];
        }
        setValue(key, restVesselData[key]);
      });

      if (VesselHistory && VesselHistory.length > 0) {
        setStatusHistoryData(VesselHistory);
      }

      if (VesselInventoryImages && VesselInventoryImages.length > 0) {
        setCommonInventoryImage({
          name: VesselInventoryImages[0].fileName,
          file: VesselInventoryImages[0].fileName,
          url: getFileObjectURL(VesselInventoryImages[0]),
          status: "Uploaded",
        });
      }

      if (VesselImages && VesselImages.length > 0) {
        const vesselImage = VesselImages[0];
        setImage({
          name: vesselImage.fileName,
          file: vesselImage.fileName,
          status: "Uploaded",
          url: getFileObjectURL(vesselImage),
        });
      }
      if (VesselAttachments && VesselAttachments.length > 0) {
        const formattedAttachments = VesselAttachments.map((att) => ({
          id: att.id,
          name: att.fileName,
          filename: att.fileName,
          docType: att.documentTypeId || defaultDocumentType,
          useInReport: !!att.useInReport,
          status: "Uploaded",
          url: att.url,
        }));
        setAttachments(formattedAttachments);
      }
    }
  }, [vesselData, vesselId, isLoadingVessel, setValue, defaultDocumentType]);

  const tabSections = [
    "Vessel Details",
    "Attachments / Image",
    "DP Details",
    "Common Settings",
    "Other Details",
  ];

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage({
        name: file.name,
        filename: file.name,
        status: "Not Uploaded",
        file: file,
        url: getFileObjectURL(file),
      });
    }
  };

  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      docType: defaultDocumentType || "",
      useInReport: false,
      filename: file.name,
      status: "Not Uploaded",
      file: file,
      url: getFileObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleAttachmentDelete = async (attachment) => {
    try {
      const id = attachment.id;
      const attachmentIndex = attachments.findIndex((att) => att.id === id);

      if (attachment.status === "Uploaded") {
        setDeletedAttachments((prev) => [...prev, attachment]);
      }

      const updatedAttachments = attachments.filter((att) => att.id !== id);
      setAttachments(updatedAttachments);

      if (attachmentIndex !== -1) {
        remove(attachmentIndex);
      }
    } catch (error) {
      toast.error("Failed to delete attachment.");
    }
  };

  const handleAttachmentDownload = async (attachment) => {
    if (attachment.status === "Not Uploaded") {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(attachment.file);
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        if (attachment.url) {
          const fileUrl =
            import.meta.env.VITE_API_URL + "/uploads/" + attachment.url;
          window.open(fileUrl, "_blank");
        } else {
          const response = await axiosInstance.get(
            `/attachments/${attachment.id}`,
            {
              responseType: "blob",
            }
          );

          const contentType =
            response.headers["content-type"] || "application/octet-stream";
          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = attachment.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        toast.error("Failed to download the file. Please try again.");
      }
    }
  };

  const handleIsMainInventoryImage = async (isMain) => {
    if (!vesselId) {
      toast.error("Please save the vessel first to set the common inventory image.");
      return;
    }

    const form = new FormData();
    if (commonInventoryImage.status === "Not Uploaded") {
      form.append("commonInventoryImage", commonInventoryImage.file);
    }

    form.append("isMain", isMain);
    
    try {
      const response = await axiosInstance.post(
        `/vessels/common-inventory-image/${vesselId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Common Inventory Image updated successfully.");
      } else {
        toast.error("Failed to update Common Inventory Image.");
      }
    } catch (error) {
      console.error("Error updating Common Inventory Image:", error);
      toast.error("Failed to update Common Inventory Image.");
    }
  };

  const handleCommonInventoryImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCommonInventoryImage({
        name: file.name,
        file: file,
        url: getFileObjectURL(file),
        status: "Not Uploaded",
      });
    }
  };

  const handleAttachmentDocTypeChange = (index, value) => {
    setAttachments((prev) =>
      prev.map((att, i) => (i === index ? { ...att, docType: value } : att))
    );
  };

  const handleAttachmentUseInReportChange = (index, checked) => {
    setAttachments((prev) =>
      prev.map((att, i) => (i === index ? { ...att, useInReport: checked } : att))
    );
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    if (attachments.length > 0) {
      attachments
        .filter((item) => item.status === "Not Uploaded")
        .forEach((att) => {
          formData.append("attachments[]", att.file);
        });
    }

    if (image && image.status === "Not Uploaded") {
      formData.append("image", image.file);
    }

    if (
      commonInventoryImage &&
      commonInventoryImage.status === "Not Uploaded"
    ) {
      formData.append("commonInventoryImage", commonInventoryImage.file);
    }

    if (surveySameAsStart && data.ihmSurveyStartDate) {
      data.ihmSurveyEndDate = data.ihmSurveyStartDate;
      data.ihmSurveyEndDateIsSame = true;
    }

    data.grossTonnageMT = parseFloat(data.grossTonnageMT);
    // The checkbox field holds a real boolean. Comparing it to the string
    // "true" stored every save as unticked, even for already-ticked vessels.
    data.readyForMaintenance =
      data.readyForMaintenance === true || data.readyForMaintenance === "true";

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        if (key.endsWith("Date") && data[key]) {
          data[key] = new Date(data[key]).toISOString();
        }
      }
    });

    // Add docTypes to attachments in data
    data.attachments = attachments.map((att) => ({
      ...att,
      docType: att.docType,
    }));

    console.log("Submitting data:", data);

    // Close only once the save succeeds. onSettled also closed on a rejected
    // save, silently discarding the edits; useVessel now shows the error and
    // the form stays open so it can be fixed and saved again.
    if (!vesselId) {
      formData.append("data", JSON.stringify(data));
      vesselMutation.mutate(formData, {
        onSuccess: () => {
          handleOnClose();
          queryClient.invalidateQueries({ queryKey: ["vessels"] });
        },
      });
    } else {
      data.deletedAttachments = JSON.stringify(deletedAttachments);
      formData.append("data", JSON.stringify(data));
      vesselMutation.mutate(
        { id: vesselId, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vessel", vesselId] });
            handleOnClose();
          },
        }
      );
    }
  };

  // Tab that renders each validated field; everything not listed is on
  // Vessel Details (0). Only the active tab is mounted, so without this an
  // error on another tab stayed invisible and Update silently did nothing.
  const FIELD_TAB = {
    headerFreeTextCaption: 3,
    headerFreeTextValue: 3,
    poDataGapDisclaimer: 3,
    commonReferenceNo: 3,
    discontinued: 4,
    discontinueRemarks: 4,
    vesselEmailId: 4,
  };

  const onInvalid = (formErrors) => {
    const entries = Object.entries(formErrors);
    if (entries.length === 0) return;

    const firstTab = Math.min(...entries.map(([name]) => FIELD_TAB[name] ?? 0));
    setTabIndex(firstTab);

    const messages = entries.map(([, error]) => error?.message).filter(Boolean);
    toast.error(
      `Please fix on "${tabSections[firstTab]}" before saving: ${messages.join("; ")}`
    );
  };

  const handleOnClose = () => {
    setTabIndex(0);
    setWasDiscontinued(false);
    setAttachments([]);
    setImage(null);
    setCommonInventoryImage(null);
    setSurveySameAsStart(false);
    setValue("ihmSurveyEndDateIsSame", false);
    reset();
    setVessel({
      id: "",
      open: false,
    });
    if (onClose) {
      onClose();
    }
  };

  return (
    <OPPageContainer>
      <Drawer anchor="right" open={vessel.open} onClose={handleOnClose}>
        <Box
          sx={{
            width: isSmallScreen ? "100vw" : 900,
            padding: isSmallScreen ? 3 : 4,
            // Mandatory-field stars in red, for every required input here.
            "& .MuiFormLabel-asterisk": { color: "error.main" },
          }}
        >
          <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
            Vessel Details
          </Typography>
          <Box
            display="flex"
            gap={1}
            mb={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            {tabSections.map((label, index) => (
              <Button
                key={index}
                variant={tabIndex === index ? "contained" : "outlined"}
                onClick={() => handleTabChange(index)}
                color="secondary"
                sx={{
                  backgroundColor:
                    tabIndex === index ? "#EDE7F6" : "transparent",
                  color: tabIndex === index ? "#4A148C" : "#7B1FA2",
                  fontSize: isSmallScreen ? "12px" : "14px",
                  fontWeight: "",
                  padding: isSmallScreen ? "6px 10px" : "8px 14px",
                  minWidth: isSmallScreen ? "75px" : "100px",
                  borderRadius: "16px",
                  border:
                    tabIndex === index
                      ? "2px solid #7B1FA2"
                      : "2px solid transparent",
                  boxShadow:
                    tabIndex === index
                      ? "0px 4px 8px rgba(123, 31, 162, 0.3)"
                      : "0px 2px 4px rgba(123, 31, 162, 0.1)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#D1C4E9",
                    boxShadow: "0px 6px 12px rgba(123, 31, 162, 0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <OPDivider />

          {/* noValidate: `required` on inputs is only for the red stars. Left to
              the browser, a required field on the visible tab (e.g. Discontinue
              Remarks) cancelled the submit before react-hook-form ran, so the
              Joi message and toast never appeared. Joi owns all validation. */}
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            {tabIndex === 0 && (
              <Box display="flex" flexDirection="column" gap={3} p={3}>
                <Box border={1} borderColor="green" p={2} borderRadius={2}>
                  <h3>Vessel Info</h3>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap={2}
                  >
                    {[
                      {
                        name: "vesselName",
                        label: "Vessel Name",
                        required: true,
                      },
                      {
                        name: "imoNumber",
                        label: "IMO Number",
                        required: true,
                      },
                      { name: "vesselType", label: "Vessel Type", required: true },
                      // 4th slot of the 2-column grid = directly below IMO Number
                      {
                        name: "callSign",
                        label: "Call Sign/Distinctive Number",
                        required: true,
                      },
                      { name: "flag", label: "Flag", required: true },
                      { name: "classSociety", label: "Class Society", required: true },
                      { name: "portOfRegistry", label: "Port of Registry", required: true },
                      {
                        name: "grossTonnageMT",
                        label: "Gross Tonnage MT",
                        type: "number",
                        required: true,
                      },
                      { name: "lbd", label: "L*B*D", required: true },
                      { name: "registeredOwner", label: "Registered Owner", required: true },
                      // { name: "vesselManager", label: "Vessel Manager" },
                      // { name: "clientName", label: "Client Name" },
                    ].map(({ name, label, required, type = "text" }) => (
                      <Controller
                        key={name}
                        name={name}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={label}
                            type={type}
                            required={required}
                            fullWidth
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                          />
                        )}
                      />
                    ))}
                    {/* A Select's `label` only reserves the notch; the text
                        itself needs an InputLabel inside a FormControl. */}
                    <Controller
                      name="vesselManager"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.vesselManager}>
                          <InputLabel id="vessel-manager-label">
                            Vessel Manager
                          </InputLabel>
                          <Select
                            {...field}
                            labelId="vessel-manager-label"
                            label="Vessel Manager"
                          >
                            <MenuItem value="">
                              <em>Select Manager</em>
                            </MenuItem>
                            {managers.length > 0 &&
                              managers.map((manager) => (
                                <MenuItem key={manager.id} value={manager.id}>
                                  {manager.companyName}
                                </MenuItem>
                              ))}
                          </Select>
                          {errors.vesselManager && (
                            <FormHelperText>
                              {errors.vesselManager.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />

                    <Controller
                      name="clientName"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          required
                          error={!!errors.clientName}
                        >
                          <InputLabel id="client-name-label">
                            Client Name
                          </InputLabel>
                          <Select
                            {...field}
                            labelId="client-name-label"
                            label="Client Name"
                          >
                            <MenuItem value="">
                              <em>Select Client</em>
                            </MenuItem>
                            {clients.length > 0 &&
                              clients.map((client) => (
                                <MenuItem key={client.id} value={client.id}>
                                  {client.companyName}
                                </MenuItem>
                              ))}
                          </Select>
                          {errors.clientName && (
                            <FormHelperText>
                              {errors.clientName.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />

                    <Controller
                      name="registeredOwnerAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Registered Owner Address"
                          required
                          fullWidth
                          multiline
                          rows={2}
                          error={!!errors.registeredOwnerAddress}
                          helperText={errors.registeredOwnerAddress?.message}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box border={1} borderColor="green" p={2} borderRadius={2}>
                  <h3>Vessel Built Details</h3>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap={2}
                  >
                    {[
                      {
                        name: "deliveryDate",
                        label: "Delivery Date",
                        type: "date",
                        required: true,
                      },
                      {
                        name: "keelLaidDate",
                        label: "Keel Laid Date",
                        type: "date",
                        required: true,
                      },
                      { name: "shipYardName", label: "Ship Yard Name", required: true },
                    ].map(({ name, label, required, type = "text" }) => (
                      <Controller
                        key={name}
                        name={name}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={label}
                            type={type}
                            required={required}
                            InputLabelProps={
                              type === "date" ? { shrink: true } : {}
                            }
                            fullWidth
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                          />
                        )}
                      />
                    ))}
                    <Controller
                      name="shipYardAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Ship Yard Address"
                          required
                          fullWidth
                          multiline
                          rows={2}
                          error={!!errors.shipYardAddress}
                          helperText={errors.shipYardAddress?.message}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box border={1} borderColor="green" p={2} borderRadius={2}>
                  <h3>Survey / Maintenance Details</h3>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap={2}
                  >
                    <Controller
                      name="ihmClass"
                      control={control}
                      defaultValue={""}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          required
                          error={!!errors.ihmClass}
                        >
                          <InputLabel id="ihm-class-label">IHM Class</InputLabel>
                          <Select
                            {...field}
                            labelId="ihm-class-label"
                            label="IHM Class"
                          >
                            <MenuItem value="">
                              <em>Select IHM Class</em>
                            </MenuItem>
                            <MenuItem value="Class A">Class A</MenuItem>
                            <MenuItem value="Class B">Class B</MenuItem>
                          </Select>
                          {errors.ihmClass && (
                            <FormHelperText>{errors.ihmClass.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="ihmSurveyStartDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="IHM Survey Start Date"
                          required
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.ihmSurveyStartDate}
                          helperText={errors.ihmSurveyStartDate?.message}
                        />
                      )}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="ihmSurveyEndDateIsSame"
                          checked={surveySameAsStart}
                          onChange={(e) =>
                            setSurveySameAsStart(e.target.checked)
                          }
                        />
                      }
                      label="Survey End Dt same as Start Dt"
                    />
                    <Controller
                      name="ihmSurveyEndDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="IHM Survey End Date"
                          required
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          disabled={surveySameAsStart}
                          error={!!errors.ihmSurveyEndDate}
                          helperText={errors.ihmSurveyEndDate?.message}
                        />
                      )}
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="readyForMaintenance"
                          control={control}
                          render={({ field: { onChange, value, ...rest } }) => (
                            <Checkbox
                              checked={Boolean(value)}
                              onChange={(e) => onChange(e.target.checked)}
                              {...rest}
                            />
                          )}
                        />
                      }
                      label="Ready For Maintenance"
                    />
                    <Controller
                      name="readyForMaintenanceDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ""}
                          disabled={isReadyForMaintenance}
                          label="Ready For Maintenance Date"
                          type="date"
                          required
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.readyForMaintenanceDate}
                          helperText={errors.readyForMaintenanceDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name="maintenanceStartDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Maintenance Start Date"
                          required
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.maintenanceStartDate}
                          helperText={errors.maintenanceStartDate?.message}
                        />
                      )}
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="showVesselToOwnerManager"
                          control={control}
                          defaultValue={false}
                          render={({ field: { onChange, value, ...rest } }) => (
                            <Checkbox
                              checked={Boolean(value)}
                              onChange={(e) => onChange(e.target.checked)}
                              {...rest}
                            />
                          )}
                        />
                      }
                      label="Show Vessel to Owner/Manager"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box display="flex" flexDirection="column" gap={3} p={2}>
                <Box
                  border={1}
                  borderColor="green"
                  p={2}
                  borderRadius={2}
                  overflow="auto"
                >
                  <h3>Vessel Attachments</h3>
                  <Box sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: isSmallScreen ? "600px" : "100%" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Document Name</b>
                          </TableCell>
                          <TableCell>
                            <b>Document Type</b>
                          </TableCell>
                          <TableCell>
                            <b>File Name</b>
                          </TableCell>
                          <TableCell>
                            <b>Status</b>
                          </TableCell>
                          <TableCell>
                            <b>Use in Report</b>
                          </TableCell>
                          <TableCell>
                            <b>Del</b>
                          </TableCell>
                          <TableCell>
                            <b>Down</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attachments.map((att, index) => (
                          <TableRow key={att.id}>
                            <TableCell>{att.name}</TableCell>
                            <TableCell>
                              <TextField
                                select
                                fullWidth
                                label="Document Type"
                                value={att.docType || ""}
                                onChange={(e) =>
                                  handleAttachmentDocTypeChange(
                                    index,
                                    e.target.value
                                  )
                                }
                              >
                                {documentTypes.map((docType) => (
                                  <MenuItem key={docType.id} value={docType.id}>
                                    {docType.name}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>{att.filename}</TableCell>
                            <TableCell>{att.status}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={!!att.useInReport}
                                onChange={(e) =>
                                  handleAttachmentUseInReportChange(
                                    index,
                                    e.target.checked
                                  )
                                }
                                inputProps={{ "aria-label": `Use ${att.name} in report` }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleAttachmentDelete(att)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleAttachmentDownload(att)}
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                    component="label"
                  >
                    + Add
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleAttachmentUpload}
                    />
                  </Button>
                </Box>

                <Box
                  border={1}
                  borderColor="green"
                  p={2}
                  borderRadius={2}
                  width={isSmallScreen ? "100%" : "fit-content"}
                >
                  <h3>Vessel Image</h3>
                  <Box
                    display="flex"
                    flexDirection={isSmallScreen ? "column" : "row"}
                    alignItems="center"
                    gap={2}
                  >
                    <Box
                      width={isSmallScreen ? "100%" : 150}
                      height={100}
                      border={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {image ? (
                        <img
                          src={image.url}
                          alt="Vessel"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      component="label"
                      fullWidth={isSmallScreen}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {tabIndex === 2 && (
              <Box display="flex" flexDirection="column" gap={2} p={2}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Button variant="outlined">Assign New DP</Button>
                  <Typography variant="body2" color="text.secondary">
                    #Note: This data will not save here, but used to update all
                    the Inventory Pts using the button next to this.
                  </Typography>
                </Box>
                <Paper sx={{ overflow: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>DP Info</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Effective Period</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No records to display
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {tabIndex === 3 && (
              <Box display="flex" flexDirection="column" gap={2} p={2}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  IHM Report Fixed Text Fields
                </Typography>
                <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
                  <Controller
                    name="headerFreeTextCaption"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Header FreeText Caption (20 Chars)"
                        fullWidth
                        error={!!errors.headerFreeTextCaption}
                        helperText={errors.headerFreeTextCaption?.message}
                      />
                    )}
                  />
                  <Controller
                    name="headerFreeTextValue"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Header FreeText Value (40 Chars)"
                        fullWidth
                        sx={{ mt: 2 }}
                        error={!!errors.headerFreeTextValue}
                        helperText={errors.headerFreeTextValue?.message}
                      />
                    )}
                  />
                  <Controller
                    name="poDataGapDisclaimer"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="PO Data Gap FreeText Disclaimer (500 Chars)"
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mt: 2 }}
                        error={!!errors.poDataGapDisclaimer}
                        helperText={errors.poDataGapDisclaimer?.message}
                      />
                    )}
                  />
                </Paper>

                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Common Inventory Pt Image
                </Typography>
                <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{ width: 120, height: 120, border: "1px solid #000" }}
                    >
                      {commonInventoryImage ? (
                        <img
                          src={commonInventoryImage.url}
                          alt="Common Inventory"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </Box>
                    <Button variant="outlined" component="label">
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleCommonInventoryImageUpload}
                      />
                    </Button>
                  </Box>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleIsMainInventoryImage(1)}>
                    Update All Inventory Pts to Use Common Image
                  </Button>
                </Paper>

                <Controller
                  name="commonReferenceNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Common Reference No/ Drawing No"
                      required
                      fullWidth
                      sx={{ mt: 2 }}
                      error={!!errors.commonReferenceNo}
                      helperText={errors.commonReferenceNo?.message}
                    />
                  )}
                />
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Update Reference/Drawing No for All Inventory Pts
                </Button>
              </Box>
            )}

            {tabIndex === 4 && (
              <Box display="flex" flexDirection="column" gap={3} p={2}>
                {/* Vessel Active / Discontinued Info */}
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Vessel Active / Discontinued Info
                </Typography>
                <Paper
                  sx={{
                    padding: 2,
                    border: "2px solid #008000",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="discontinued"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Checkbox {...field} checked={field.value} />
                            <label htmlFor={field.name}>Discontinued</label>
                          </>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="discontinueRemarks"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Discontinue Remarks"
                            required={isDiscontinued && !wasDiscontinued}
                            multiline
                            rows={3}
                            fullWidth
                            error={!!errors.discontinueRemarks}
                            helperText={errors.discontinueRemarks?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Vessel Status History */}
                {!!vesselId && (
                  <>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      Vessel Status History
                    </Typography>
                    <Paper
                      sx={{
                        border: "2px solid #008000",
                        borderRadius: 2,
                        overflow: "auto",
                        maxHeight: 200,
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#e0f7e9" }}>
                            <TableCell>Entry Date</TableCell>
                            <TableCell>Active Date</TableCell>
                            <TableCell>Discontinue Date</TableCell>
                            <TableCell>Active Remarks</TableCell>
                            <TableCell>Discontinue Remarks</TableCell>
                            <TableCell>Client Name</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Field names match VesselHistory: discontinuedDate /
                              discontinuedRemarks (the "discontinue*" spelling was
                              always blank), and clientName is a ClientManager id. */}
                          {(statusHistoryData ?? []).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                No status changes recorded yet
                              </TableCell>
                            </TableRow>
                          )}
                          {(statusHistoryData ?? []).map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{formatAuditDate(row.entryDate)}</TableCell>
                              <TableCell>{formatAuditDate(row.activeDate)}</TableCell>
                              <TableCell>{formatAuditDate(row.discontinuedDate)}</TableCell>
                              <TableCell>{row.activeRemarks}</TableCell>
                              <TableCell>{row.discontinuedRemarks}</TableCell>
                              <TableCell>
                                {clients.find((c) => c.id === row.clientName)
                                  ?.companyName ?? row.clientName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </>
                )}

                {/* Vessel Other Info */}
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Vessel Other Info
                </Typography>
                <Paper
                  sx={{
                    padding: 2,
                    border: "2px solid #008000",
                    borderRadius: 2,
                  }}
                >
                  <Controller
                    name="vesselEmailId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Vessel Email ID"
                        fullWidth
                        error={!!errors.vesselEmailId}
                        helperText={errors.vesselEmailId?.message}
                      />
                    )}
                  />
                </Paper>
              </Box>
            )}

            {/* Edit mode only, straight from the loaded vessel. Vessels
                updated before this was recorded have no editor, so the name
                falls back to "—" but the date is still real. */}
            {vesselId && audit && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary">
                  Created By: {auditUserName(audit.createdByUser) || "—"}{" "}
                  [{formatAuditDate(audit.createdAt)}]
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated By: {auditUserName(audit.updatedByUser) || "—"}{" "}
                  [{formatAuditDate(audit.updatedAt)}]
                </Typography>
              </Box>
            )}

            <Box
              display="flex"
              justifyContent="space-between"
              mt={3}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                disabled={tabIndex === 0}
                onClick={() => setTabIndex(tabIndex - 1)}
              >
                Previous
              </Button>
              {/* Distinct keys: without them React reuses the same <button> and
                  flips it to type="submit" while the Next click on Common
                  Settings is still being handled, so the browser submitted
                  the form and validation errors (e.g. Call Sign) popped up. */}
              {tabIndex < 4 ? (
                <Button
                  key="next-tab"
                  type="button"
                  variant="contained"
                  onClick={() => setTabIndex(tabIndex + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={vesselMutation.isPending}
                >
                  {vesselMutation.isPending
                    ? "Saving..."
                    : vesselId
                      ? "Update"
                      : "Save"}
                </Button>
              )}
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleOnClose}
              >
                Close
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </OPPageContainer>
  );
};

export default AddEditVesselDrawer;
