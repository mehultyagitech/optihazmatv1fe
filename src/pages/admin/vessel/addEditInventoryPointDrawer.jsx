import { useEffect, useState } from "react";
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
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import genericState from "../../../utils/States/Generic";
import { useRecoilState, useRecoilValue } from "recoil";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryPointSchema } from "../../../validations/inventoryPoint";
import {
  locationPointAddDrawerState,
  locationPointState,
} from "../../../utils/States/LocationDiagram";
import axiosInstance from "../../../api/axiosInstance";

const AddEditInventoryPointDrawer = ({ onClose = () => {} }) => {
  const theme = useTheme();
  const {
    SubLocations,
    Equipments,
    Compartments,
    Objects,
    Inventory,
    DocumentTypes,
  } = useRecoilValue(genericState);
  const [{ x, y, pinId, open }, setDrawer] = useRecoilState(
    locationPointAddDrawerState
  );
  const { id: locationId } = useRecoilValue(locationPointState);
  const [attachments, setAttachments] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    saveWithoutImage: false,
    useCommonImage: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const queryClient = useQueryClient();

  const pinDataById = useQuery({
    queryKey: ["pinData", pinId],
    queryFn: async () => {
      if (!pinId) return null;
      const response = await axiosInstance.get(`/pins/${pinId}`);
      return response.data;
    },
    enabled: !!pinId,
    select: (data) => data.data,
  });

  useEffect(() => {
    if (pinDataById.isSuccess && !!pinDataById?.data) {
      const { PinAttachments, PinImages, ...pinData } = pinDataById?.data;
      const formData = {
        subLocationId: pinData.subLocationId || "",
        equipmentId: pinData.equipmentId || "",
        compartmentId: pinData.compartmentId || "",
        objectId: pinData.ObjectId || "",
        description: pinData.Description || "",
        inventoryId: pinData.inventoryId || "",
        isPCHM: pinData.isPCHM || false,
        manufacturerBrand: pinData.manufacturerBrand || "",
        referenceNo: pinData.referenceNo || "",
        remarks: pinData.remarks || "",
        saveWithoutImage: pinData.saveWithoutImage || false,
        useCommonImage: pinData.useCommonImage || false,
        isRemovedFromIHM: pinData.isRemovedFromIHM || false,
        isReplaced: pinData.isReplaced || false,
        removedDate: pinData.removedDate || "",
        removedRemarks: pinData.removedRemarks || "",
      };

      // Set attachments
      const formattedAttachments = PinAttachments?.map((att) => ({
        id: att.id,
        name: att.fileName,
        type: att.documentTypeId, // Document type id will be set by user
        filename: att.url,
        status: "Uploaded",
        file: att,
      }));

      const formattedImages = PinImages?.map((img) => ({
        id: img.id,
        file: img,
        url: import.meta.env.VITE_API_URL + "/uploads/" + img.url,
        name: img.fileName,
        status: "Uploaded",
      }));

      setImages(formattedImages);
      setAttachments(formattedAttachments);
      setForm(formData);
    }
  }, [pinDataById.isSuccess]);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabIndex, setTabIndex] = useState(0);

  const tabSections = [
    "Details",
    "Hazmats",
    "Images",
    "PO Items",
    "Remove/Replace",
    "Link Attachments",
    "Add Attachments",
  ];

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  // Image upload handler for multiple images
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      status: "New",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageDelete = (file) => {
    if (file.status === "Uploaded") {
      setDeletedImages((prev) => [...prev, file]);
    }
    setImages((prev) => prev.filter((img) => img.id !== file.id));
  };

  const handleImageDownload = (file) => {
    if (file) {
      if (file.status === "New") {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const url = import.meta.env.VITE_API_URL + "/uploads/" + file.name;
        window.open(url, "_blank");
      }
    }
  };

  // Helper to update form state
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isRemovedFromIHM") {
      setForm((prev) => ({
        ...prev,
        isRemovedFromIHM: checked,
        isReplaced: checked ? false : prev.isReplaced,
      }));
    } else if (name === "isReplaced") {
      setForm((prev) => ({
        ...prev,
        isReplaced: checked,
        isRemovedFromIHM: checked ? false : prev.isRemovedFromIHM,
      }));
    } else if (name === "removedDate" || name === "removedRemarks") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Add Attachment Upload Handler
  const handleAttachmentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        type: "", // Document type id will be set by user
        filename: file.name,
        status: "New",
        file,
      };
      setAttachments((prev) => [...prev, newAttachment]);
    }
  };

  // Handler to update document type for an attachment
  const handleAttachmentTypeChange = (id, typeId) => {
    setAttachments((prev) =>
      prev.map((att) => (att.id === id ? { ...att, type: typeId } : att))
    );
  };

  // Add Attachment Delete Handler
  const handleAttachmentDelete = (file) => {
    if (file.status === "Uploaded") {
      setDeletedAttachments((prev) => [...prev, file]);
    }
    setAttachments((prev) => prev.filter((att) => att.id !== file.id));
  };

  // Add Attachment Download Handler
  const handleAttachmentDownload = (file) => {
    if (file) {
      if (file.status === "New") {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file.file);
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (file.status === "Uploaded") {
        const url = import.meta.env.VITE_API_URL + "/uploads/" + file.filename;
        window.open(url, "_blank");
      }
    }
  };

  const validateForm = () => {
    const { error } = inventoryPointSchema.validate(form, {
      abortEarly: false,
    });
    if (!error) {
      setFormErrors({});
      return true;
    }
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    setFormErrors(errors);
    return false;
  };

  const handleClose = () => {
    setForm({
      saveWithoutImage: false,
      useCommonImage: false,
    });
    setDrawer((prev) => ({
      open: false,
      pinId: "",
      x: 0,
      y: 0,
    }));
    setAttachments([]);
    setImages([]);
    setDeletedImages([]);
    setDeletedAttachments([]);
    setFormErrors({});
    setTabIndex(0);
    onClose();
  };

  const savePoint = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();

      form.append("compartment", data.compartmentId);
      form.append("description", data.description);
      form.append("equipment", data.equipmentId);
      form.append("inventory", data.inventoryId);
      form.append("isPCHM", data.isPCHM);
      form.append("isRemovedFromIHM", data.isRemovedFromIHM);
      form.append("isReplaced", data.isReplaced);
      form.append("manufacturerBrand", data.manufacturerBrand);
      form.append("object", data.objectId);
      form.append("referenceNo", data.referenceNo);
      form.append("remarks", data.remarks);
      form.append("removedDate", data.removedDate);
      form.append("removedRemarks", data.removedRemarks);
      form.append("saveWithoutImage", data.saveWithoutImage);
      form.append("subLocation", data.subLocationId);
      form.append("useCommonImage", data.useCommonImage);

      data?.attachments?.forEach((attachment, index) => {
        if (attachment.file && attachment.status == "New") {
          form.append(`attachments[${index}].file`, attachment.file);
          form.append(`attachments[${index}].name`, attachment.name);
          form.append(`attachments[${index}].documentType`, attachment.type);
          form.append(`attachments[${index}].status`, attachment.status);
        }
      });

      data?.images?.forEach((image, index) => {
        if (image.file && image.status == "New") {
          form.append(`images[${index}].file`, image.file);
          form.append(`images[${index}].name`, image.name);
        }
      });

      form.append("x", x);
      form.append("y", y);
      form.append("locationDiagramId", locationId);

      let response;

      if (!!pinId) {
        form.append("deletedImages", JSON.stringify(deletedImages));
        form.append("deletedAttachments", JSON.stringify(deletedAttachments));

        response = await axiosInstance.put(`/pins/${pinId}`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        });
      } else {
        response = await axiosInstance.post("/pins", form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        });
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pinData", pinId]);
      queryClient.invalidateQueries(["pinsListing"]);
      handleClose();
    },
  });

  return (
    <OPPageContainer>
      <Drawer anchor="right" open={open} onClose={() => handleClose()}>
        <Box
          sx={{
            width: isSmallScreen ? "100vw" : 900,
            padding: isSmallScreen ? 3 : 4,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
            Details
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

          {/* Vessel Details Form */}
          {tabIndex === 0 && (
            <Box display="flex" flexDirection="column" gap={3} p={3}>
              {/* Location Information */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3 style={{ borderBottom: "1px solid green" }}>
                  Location Information
                </h3>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(2, 1fr)"
                  gap={2}
                >
                  <TextField
                    label="Sub Location"
                    fullWidth
                    name="subLocationId"
                    select
                    value={form.subLocationId || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.subLocationId}
                    helperText={formErrors.subLocationId || ""}
                  >
                    {SubLocations?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Equipment"
                    fullWidth
                    name="equipmentId"
                    select
                    value={form.equipmentId || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.equipmentId}
                    helperText={formErrors.equipmentId}
                  >
                    {Equipments?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Compartment"
                    fullWidth
                    name="compartmentId"
                    select
                    value={form.compartmentId || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.compartmentId}
                    helperText={formErrors.compartmentId}
                  >
                    {Compartments?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Object"
                    fullWidth
                    name="objectId"
                    select
                    value={form.objectId || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.objectId}
                    helperText={formErrors.objectId}
                  >
                    {Objects?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Description"
                    fullWidth
                    name="description"
                    multiline
                    rows={2}
                    value={form.description || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                  />
                  <TextField
                    required
                    label="Inventory Class"
                    fullWidth
                    name="inventoryId"
                    select
                    value={form.inventoryId || ""}
                    onChange={handleFormChange}
                    error={!!formErrors.inventoryId}
                    helperText={formErrors.inventoryId}
                  >
                    {Inventory?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isPCHM"
                        checked={!!form.isPCHM}
                        onChange={handleFormChange}
                      />
                    }
                    label="Is PCHM"
                  />
                </Box>
              </Box>

              {/* Other Information */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3 style={{ borderBottom: "1px solid green" }}>
                  Other Information
                </h3>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(1, 1fr)"
                  gap={2}
                >
                  <TextField
                    label="Manufacturer Brand"
                    fullWidth
                    name="manufacturerBrand"
                    multiline
                    rows={2}
                    value={form.manufacturerBrand || ""}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Reference No/ Drawing No"
                    fullWidth
                    name="referenceNo"
                    multiline
                    rows={2}
                    value={form.referenceNo || ""}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Remarks"
                    fullWidth
                    name="remarks"
                    multiline
                    rows={2}
                    value={form.remarks || ""}
                    onChange={handleFormChange}
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
                <h3
                  style={{
                    color: "green",
                    marginBottom: "8px",
                    borderBottom: "2px solid green",
                    display: "inline-block",
                  }}
                >
                  Vessel Attachments
                </h3>
                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: "100%" }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
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
                          <b>Delete</b>
                        </TableCell>
                        <TableCell>
                          <b>Download</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attachments.map((att, index) => (
                        <TableRow key={att.id}>
                          <TableCell>{att.name}</TableCell>
                          <TableCell>
                            <Select
                              value={att.type || ""}
                              onChange={(e) =>
                                handleAttachmentTypeChange(
                                  att.id,
                                  e.target.value
                                )
                              }
                              displayEmpty
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="" disabled>
                                Select Type
                              </MenuItem>
                              {DocumentTypes?.map((dt) => (
                                <MenuItem key={dt.id} value={dt.id}>
                                  {dt.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>{att.filename}</TableCell>
                          <TableCell>{att.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleAttachmentDelete(att)}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleAttachmentDownload(att)}
                            >
                              <DownloadIcon fontSize="small" />
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
                  <input type="file" hidden onChange={handleAttachmentUpload} />
                </Button>
              </Box>
            </Box>
          )}

          {tabIndex === 2 && (
            <Box display="flex" flexDirection="column" gap={2} p={2}>
              <Box
                sx={{
                  border: "2px solid #4CAF50",
                  borderRadius: "8px",
                  minHeight: "120px",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: images.length ? "flex-start" : "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {images.length === 0 ? (
                  <Typography color="text.secondary">
                    No images uploaded
                  </Typography>
                ) : (
                  images.map((img) => (
                    <Box
                      key={img.id}
                      sx={{
                        width: 120,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mr: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 110,
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            display: "block",
                          }}
                        />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="center"
                        gap={1}
                        mt={1}
                      >
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleImageDelete(img)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => handleImageDownload(img)}
                        >
                          <DownloadIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "none", borderRadius: "8px" }}
                  startIcon={<AddIcon />}
                  component="label"
                  disabled={images.length >= 1}
                >
                  Add Image
                  <input
                    type="file"
                    accept="image/*"
                    multiple={false}
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="saveWithoutImage"
                      checked={!!form.saveWithoutImage}
                      onChange={handleFormChange}
                    />
                  }
                  label="Save Without Image"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="useCommonImage"
                      checked={!!form.useCommonImage}
                      onChange={handleFormChange}
                    />
                  }
                  label="Use Common Image"
                />
              </Box>
            </Box>
          )}

          {tabIndex === 3 && (
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              p={2}
              border="1px solid #ddd"
              borderRadius="8px"
            >
              {/* Select Item Button */}
              <Button
                variant="outlined"
                sx={{
                  alignSelf: "start",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                Select Item
              </Button>

              {/* Table */}
              <Paper
                sx={{
                  overflow: "auto",
                  border: "2px solid #4CAF50",
                  borderRadius: "8px",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Item Details
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Hazmats (Total Mass)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Item Replaced
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ color: "#555" }}
                      >
                        No records to display
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {tabIndex === 4 && (
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              p={2}
              border="2px solid #4CAF50"
              borderRadius="8px"
              width="fit-content"
            >
              {/* Header */}
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#4CAF50",
                  fontWeight: "bold",
                  borderBottom: "1px solid #4CAF50",
                }}
              >
                – Inventory Remove/Replace Information
              </Typography>

              {/* Checkboxes */}
              <Box display="flex" alignItems="center" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isRemovedFromIHM"
                      checked={!!form.isRemovedFromIHM}
                      onChange={handleFormChange}
                      sx={{ color: "blue" }}
                    />
                  }
                  label="Is Removed from IHM"
                />
                <Typography
                  variant="body2"
                  sx={{ color: "blue", cursor: "pointer" }}
                >
                  Note: Removal document is required to be attached
                </Typography>
              </Box>

              {form?.isRemovedFromIHM && (
                <>
                  <TextField
                    label="Removed Date *"
                    variant="outlined"
                    name="removedDate"
                    type="date"
                    value={form.removedDate || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />

                  <TextField
                    label="Removed Remarks *"
                    variant="outlined"
                    name="removedRemarks"
                    multiline
                    rows={3}
                    value={form.removedRemarks || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="isReplaced"
                    checked={!!form.isReplaced}
                    onChange={handleFormChange}
                    sx={{ color: "#555" }}
                  />
                }
                label="Is Replaced"
              />
            </Box>
          )}

          {tabIndex === 5 && (
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              p={2}
              border="2px solid #4CAF50"
              borderRadius="8px"
            >
              {/* Header Title */}
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#4CAF50",
                  fontWeight: "bold",
                  borderBottom: "1px solid #4CAF50",
                }}
              >
                – Link Attachments to Inventory Point
              </Typography>

              {/* Table */}
              <Paper sx={{ overflow: "auto", borderRadius: "8px" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f8e6" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Document Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Document Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Down
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Link Document
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ color: "#555" }}
                      >
                        No records to display
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {tabIndex === 6 && (
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              p={2}
              border="2px solid #4CAF50"
              borderRadius="8px"
            >
              {/* Header Title */}
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#4CAF50",
                  fontWeight: "bold",
                  borderBottom: "1px solid #4CAF50",
                }}
              >
                – Link Attachments to Inventory Point
              </Typography>

              {/* Table */}
              <Paper sx={{ overflow: "auto", borderRadius: "8px" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f8e6" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Document Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Document Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Down
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                        Link Document
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ color: "#555" }}
                      >
                        No records to display
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
                onClick={() => {
                  if (validateForm()) {
                    savePoint.mutate({ ...form, attachments, images });
                  } else {
                    console.error("Form validation failed", formErrors);
                  }
                }}
                disabled={savePoint.isPending}
              >
                {savePoint.isPending ? "Saving..." : "Save Point"}
              </Button>
            )}
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Drawer>
    </OPPageContainer>
  );
};

export default AddEditInventoryPointDrawer;
