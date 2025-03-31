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

const AddEditVesselDrawer = ({ onClose }) => {
  const [vessel, setVessel] = useRecoilState(vesselState);
  const vesselId = vessel.id;

  const { getVesselById, createVessel, updateVessel } = useVessel();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabIndex, setTabIndex] = useState(0);
  const [ihmClass, setIhmClass] = useState("");
  const [surveySameAsStart, setSurveySameAsStart] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [image, setImage] = useState();
  const [commonInventoryImage, setCommonInventoryImage] = useState();
  const vesselMutation = vesselId ? updateVessel() : createVessel();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: joiResolver(vesselSchema),
  });

  // Get single vessel by ID (if in edit mode)
  const { data: vesselData, isLoading: isLoadingVessel } = getVesselById(vesselId);

  const getFileObjectURL = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return process.env.REACT_APP_API_URL + '/uploads/' + file.url;
  };

  // Effect to populate form when vessel data is loaded
  useEffect(() => {
    if (vesselData && vesselId) {
      const {
        VesselImages,
        VesselAttachments,
        ...restVesselData
      } = vesselData;
  
      Object.keys(restVesselData).forEach((key) => {
        if (key.endsWith("Date") && restVesselData[key]) {
          restVesselData[key] = new Date(restVesselData[key])
            .toISOString()
            .split("T")[0];
        }
        setValue(key, restVesselData[key]);
      });

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
        console.log(VesselAttachments)
        const formattedAttachments = VesselAttachments.map((att) => ({
          id: att.id,
          name: att.fileName,
          filename: att.fileName,
          type: att.fileName.split('.').pop().toUpperCase(),
          status: "Uploaded",
          url: att.url
        }));
        setAttachments(formattedAttachments);
      }
    }
  }, [vesselData, vesselId, setValue]);

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
      type: file.type.split('/').pop().toUpperCase(),
      filename: file.name,
      status: "Not Uploaded",
      file: file,
      url: getFileObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleAttachmentDelete = async (id) => {
    try {
      const attachment = attachments.find((att) => att.id === id);
      console.log(attachment, 'attachment to del')

      if (attachment && attachment.status === "Uploaded") {
        const response = await axiosInstance.delete(`/attachments/${attachment.id}`);
        console.log(response, 'DELETE ATTACHMENT RESPONSE');
      }
      const updatedAttachments = attachments.filter((att) => att.id !== id);
      setAttachments(updatedAttachments);
    } catch (error) {
      toast.error("Failed to delete attachment.");
    }
  };

  const handleAttachmentDownload = async (id) => {
    const attachment = attachments.find((att) => att.id === id);
    
    if (attachment.status === 'Not Uploaded') {
      // For local files that haven't been uploaded yet
      const link = document.createElement("a");
      link.href = URL.createObjectURL(attachment.file);
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For files stored on the server
      try {
        // If the file has a direct URL
        if (attachment.url) {
          // Create a link to the file on the server
          const fileUrl = process.env.REACT_APP_API_URL + '/uploads/' + attachment.url;
          window.open(fileUrl, '_blank');
        } else {
          // Alternatively, fetch the file through the API
          const response = await axiosInstance.get(`/attachments/${attachment.id}`, {
            responseType: "blob",
          });
          
          const contentType = response.headers['content-type'] || 'application/octet-stream';
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
        console.error("Error downloading attachment:", error);
        toast.error("Failed to download the file. Please try again.");
      }
    }
  };

  const handleCommonInventoryImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCommonInventoryImage(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    if (attachments.length > 0) {
      attachments.filter(item => item.status === "Not Uploaded").forEach((att) => {
        formData.append("attachments[]", att.file);
      });
    }

    if (image && image.status === "Not Uploaded") {
      formData.append("image", image.file);
    }

    if (commonInventoryImage) {
      formData.append("commonInventoryImage", commonInventoryImage);
    }

    if (surveySameAsStart && data.ihmSurveyStartDate) {
      data.ihmSurveyEndDate = data.ihmSurveyStartDate;
      data.ihmSurveyEndDateIsSame = true;
    }

    data.grossTonnageMT = parseFloat(data.grossTonnageMT);
    data.readyForMaintenance =
      data.readyForMaintenance === "true" ? true : false;

    // Append vessel data
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        if (key.endsWith("Date") && data[key]) {
          data[key] = new Date(data[key]).toISOString();
        }
      }
    });

    formData.append('data', JSON.stringify(data));

    if (!vesselId) {
      await axiosInstance.post("/vessels", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    } else {
      await axiosInstance.put(`/vessels/${vesselId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    toast.success("Vessel saved successfully!");
    handleOnClose();
  };

  const handleOnClose = () => {
    setTabIndex(0);
    setAttachments([]);
    setImage(null);
    setCommonInventoryImage(null);
    setIhmClass("");
    setSurveySameAsStart(false);
    setValue("ihmSurveyEndDateIsSame", false);
    reset();
    setVessel({
      id: '',
      open: false
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
          }}
        >
          <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
            Vessel Details
          </Typography>
          {/* Tabs */}
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

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Vessel Details Form */}
            {tabIndex === 0 && (
              <Box display="flex" flexDirection="column" gap={3} p={3}>
                {/* Vessel Info */}
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
                      { name: "vesselType", label: "Vessel Type" },
                      { name: "flag", label: "Flag" },
                      { name: "classSociety", label: "Class Society" },
                      { name: "portOfRegistry", label: "Port of Registry" },
                      {
                        name: "grossTonnageMT",
                        label: "Gross Tonnage MT",
                        type: "number",
                      },
                      { name: "lbd", label: "L*B*D" },
                      { name: "registeredOwner", label: "Registered Owner" },
                      { name: "vesselManager", label: "Vessel Manager" },
                      { name: "clientName", label: "Client Name" },
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
                    <Controller
                      name="registeredOwnerAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Registered Owner Address"
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

                {/* Vessel Built Details */}
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
                      },
                      {
                        name: "keelLaidDate",
                        label: "Keel Laid Date",
                        type: "date",
                      },
                      { name: "shipYardName", label: "Ship Yard Name" },
                    ].map(({ name, label, type = "text" }) => (
                      <Controller
                        key={name}
                        name={name}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={label}
                            type={type}
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

                {/* Survey / Maintenance Details */}
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
                      render={({ field }) => (
                        <Select
                          value={ihmClass}
                          onChange={(e) => setIhmClass(e.target.value)}
                          name="ihmClass"
                          displayEmpty
                          fullWidth
                          error={!!errors.ihmClass}
                          {...field}
                        >
                          <MenuItem value="" disabled>
                            IHM Class
                          </MenuItem>
                          <MenuItem value="Class A">Class A</MenuItem>
                          <MenuItem value="Class B">Class B</MenuItem>
                        </Select>
                      )}
                    />
                    <Controller
                      name="ihmSurveyStartDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="IHM Survey Start Date"
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
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          disabled={surveySameAsStart}
                          error={!!errors.ihmSurveyEndDate}
                          helperText={errors.ihmSurveyEndDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name="socIssueDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="SOC Issue Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.socIssueDate}
                          helperText={errors.socIssueDate?.message}
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
                      name="maintenanceStartDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Maintenance Start Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.maintenanceStartDate}
                          helperText={errors.maintenanceStartDate?.message}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box display="flex" flexDirection="column" gap={3} p={2}>
                {/* Vessel Attachments */}
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
                            <b>Del</b>
                          </TableCell>
                          <TableCell>
                            <b>Down</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attachments.map((att, index) => (
                          <TableRow key={index}>
                            <TableCell>{att.name}</TableCell>
                            <TableCell>{att.type}</TableCell>
                            <TableCell>{att.filename}</TableCell>
                            <TableCell>{att.status}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleAttachmentDelete(att.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() =>
                                  handleAttachmentDownload(att.id)
                                }
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

                {/* Vessel Image Upload */}
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
                <Button variant="outlined" sx={{ alignSelf: "start" }}>
                  Assign New DP
                </Button>
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
                          src={URL.createObjectURL(commonInventoryImage)}
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
                  <Button variant="outlined" sx={{ mt: 2 }}>
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
              <Box display="flex" flexDirection="column" gap={2} p={2}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Vessel Other Info
                </Typography>
                <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
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

            {/* Navigation Buttons */}
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
              {tabIndex < tabSections.length - 1 ? (
                <Button
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
