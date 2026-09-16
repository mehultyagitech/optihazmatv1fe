import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CropIcon from "@mui/icons-material/Crop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import OPPageContainer from "../../../components/OPPageContainer";
import {
  DocumentTypeSelector,
  LocationSelector,
  SubLocationSelector,
} from "../../../utils/States/Generic";
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import axiosInstance from "../../../api/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useImageCropper from "../../../hooks/useImageCropper";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CropLocationDiagram = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // A card's Edit on the Location Diagram page opens this page as
  // ?mode=update&diagram=<id>, preselecting "Update Existing" and that diagram.
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get("mode") === "update" ? "update" : "create"
  );
  const [existingDiagramId, setExistingDiagramId] = useState(
    searchParams.get("diagram") || ""
  );
  const documentTypes = useRecoilValue(DocumentTypeSelector);
  const vesselView = useRecoilValue(commonVesselViewState);
  const locationSelector = useRecoilValue(LocationSelector);
  const subLocationSelector = useRecoilValue(SubLocationSelector);

  const [locationCategory, setLocationCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAttachmentType, setSelectedAttachmentType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // The image to be cropped
  const imageCropper = useImageCropper({ url: selectedImage });
  const [openedImage, setOpenedImage] = useState(null);

  // This vessel's diagrams, to pick the one "Update Existing" replaces.
  const existingDiagrams = useQuery({
    queryKey: ["locationDiagramsForUpdate", vesselView?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/location-diagrams/${vesselView.id}`,
        { params: { limit: 1000 } }
      );
      return response.data.data.locationDiagrams;
    },
    enabled: mode === "update" && !!vesselView?.id,
  });

  // Picking a diagram fills in its current Location Category and Location.
  useEffect(() => {
    const diagram = existingDiagrams.data?.find((d) => d.id === existingDiagramId);
    if (diagram) {
      setLocationCategory(diagram.locationId);
      setLocation(diagram.subLocationId);
    }
  }, [existingDiagramId, existingDiagrams.data]);

  // mutation for saving the cropped image
  const { isPending, mutate, reset } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("vesselId", vesselView.id);
      formData.append("location", locationCategory);
      formData.append("subLocationId", location);
      if (openedImage?.id) {
        formData.append("attachmentImageId", openedImage.id);
        formData.append("attachmentId", openedImage.attachmentId);
      }
      // A new crop is optional when updating: without one only the Location
      // Category and Location change.
      if (imageCropper.cropData) {
        formData.append("image", imageCropper.cropData);
      }

      const isUpdate = mode === "update";
      const base = `${import.meta.env.VITE_API_URL}/api/location-diagrams/${vesselView?.id}`;

      // No try/catch here on purpose: swallowing the error made every failed
      // save run onSuccess, so a broken save looked exactly like a good one.
      const response = await (isUpdate ? axiosInstance.put : axiosInstance.post)(
        isUpdate ? `${base}/${existingDiagramId}` : base,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locationDiagrams"] });
      queryClient.invalidateQueries({ queryKey: ["locationDiagram"] });
      queryClient.invalidateQueries({ queryKey: ["locationDiagramsForUpdate"] });
      // The message is handed to the diagram list rather than shown here,
      // because this page unmounts the moment we navigate away.
      navigate("/vessels/location-diagram", {
        state: {
          flash:
            mode === "update"
              ? "Area updated successfully!"
              : "Area saved successfully!",
        },
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save the area. Please try again."
      );
    },
  });

  // Without a crop, cropData is still null and gets posted as the string
  // "null", which multer does not see as a file -- the API then answers
  // "Image is required". Catch it here so the user gets told what to do.
  const handleSaveArea = () => {
    if (mode === "update" && !existingDiagramId) {
      toast.error("Please select the diagram to update.");
      return;
    }
    if (mode === "create" && !imageCropper.cropData) {
      toast.error("Please crop the image before saving the area.");
      return;
    }
    if (!locationCategory) {
      toast.error("Please select a location category.");
      return;
    }
    if (!location) {
      toast.error("Please select an area.");
      return;
    }
    mutate();
  };

  const {
    data: docTypeDetails,
    isLoading: loadingDocType,
    error: docTypeError,
    refetch: refetchDocTypeDetails,
  } = useQuery({
    queryKey: ["documentTypeDetails", selectedAttachmentType, vesselView?.id],
    queryFn: async () => {
      if (!selectedAttachmentType || !vesselView?.id) return null;
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/api/document-types/${selectedAttachmentType}/${vesselView.id}`
      );
      return response.data.data;
    },
    enabled: !!selectedAttachmentType && !!vesselView?.id,
  });

  const [openModal, setOpenModal] = useState(false);

  const isUpdate = mode === "update";
  const isCropped = !!imageCropper.cropData;
  const images = (docTypeDetails ?? []).flatMap((docType) =>
    (docType.VesselAttachments ?? []).flatMap((attachment) => attachment.AttachmentImages ?? [])
  );

  // The three things a save needs, shown as a checklist.
  const steps = [
    { label: isUpdate ? "Pick the diagram to update" : "Select a plan image", done: isUpdate ? !!existingDiagramId : !!selectedImage },
    { label: isUpdate ? "Crop a new image (optional)" : "Crop the area", done: isCropped },
    { label: "Choose location category and area", done: !!locationCategory && !!location },
  ];

  const cardSx = {
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "#fff",
    overflow: "hidden",
  };
  const SectionTitle = ({ children, action }) => (
    <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, borderBottom: "1px solid", borderColor: "divider" }}>
      <Typography fontWeight={700} fontSize={15}>{children}</Typography>
      {action}
    </Box>
  );

  return (
    <OPPageContainer sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "#f4f6fa", minHeight: "calc(100vh - 64px)", boxSizing: "border-box" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          color: "#fff",
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #26a69a 100%)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <IconButton
            onClick={() => navigate("/vessels/location-diagram")}
            aria-label="Back to location diagrams"
            sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {isUpdate ? "Update Area" : "Mark New Area"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }} noWrap>
              Crop a location diagram from the plan · {vesselView?.name || "Unknown Vessel"}
            </Typography>
          </Box>
        </Box>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={mode}
          onChange={(_, value) => value && setMode(value)}
          sx={{
            bgcolor: "rgba(255,255,255,0.12)",
            borderRadius: 2,
            "& .MuiToggleButton-root": {
              color: "rgba(255,255,255,0.85)",
              borderColor: "rgba(255,255,255,0.3)",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            },
            "& .MuiToggleButton-root.Mui-selected": { bgcolor: "#fff", color: "#0d47a1" },
            "& .MuiToggleButton-root.Mui-selected:hover": { bgcolor: "#e3f2fd" },
          }}
        >
          <ToggleButton value="create">
            <AddLocationAltIcon fontSize="small" sx={{ mr: 0.75 }} /> Create New
          </ToggleButton>
          <ToggleButton value="update">
            <EditLocationAltIcon fontSize="small" sx={{ mr: 0.75 }} /> Update Existing
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, alignItems: "start" }}>
        {/* Image / cropper */}
        <Box sx={cardSx}>
          <SectionTitle
            action={
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedImage ? (
                  <>
                    <Tooltip title="Rotate left">
                      <IconButton size="small" onClick={imageCropper.rotateLeft} aria-label="Rotate left">
                        <RotateLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rotate right">
                      <IconButton size="small" onClick={imageCropper.rotateRight} aria-label="Rotate right">
                        <RotateRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      size="small"
                      startIcon={<ImageSearchIcon />}
                      onClick={() => setOpenModal(true)}
                      sx={{ textTransform: "none" }}
                    >
                      Change image
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => {
                        setSelectedImage(null);
                        imageCropper.resetCrop();
                        reset();
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      Clear Image
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ImageSearchIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{ textTransform: "none" }}
                  >
                    Select Image
                  </Button>
                )}
              </Box>
            }
          >
            Plan Image
          </SectionTitle>
          <Box sx={{ p: 2, bgcolor: "#f8fafc" }}>
            {selectedImage ? (
              imageCropper.cropper
            ) : (
              <Box
                onClick={() => setOpenModal(true)}
                sx={{
                  height: { xs: 320, md: "60vh" },
                  border: "2px dashed #b0bec5",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  color: "text.secondary",
                  textAlign: "center",
                  px: 2,
                  "&:hover": { borderColor: "primary.main", bgcolor: "#eef5ff" },
                }}
              >
                <CropIcon sx={{ fontSize: 56, color: "#90a4ae" }} />
                <Typography fontWeight={700} color="text.primary">
                  Select a plan image to start
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 420 }}>
                  Choose an attachment type and image from this vessel&apos;s attachments, then drag
                  a box around the area you want as a location diagram.
                </Typography>
                {isUpdate && (
                  <Typography variant="caption">
                    Updating without a new image changes only the location category and area.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Side panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={cardSx}>
            <SectionTitle
              action={
                isCropped ? (
                  <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Cropped" />
                ) : (
                  <Chip size="small" label="Not cropped" />
                )
              }
            >
              Preview
            </SectionTitle>
            <Box sx={{ p: 2 }}>
              <Box
                className="img-preview-remote"
                sx={{
                  width: "100%",
                  height: 160,
                  overflow: "hidden",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#f1f5f9",
                }}
              />
              <Button
                variant="contained"
                startIcon={<CropIcon />}
                onClick={imageCropper.getCroppedImage}
                disabled={!selectedImage}
                fullWidth
                sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
              >
                Crop Image
              </Button>
            </Box>
          </Box>

          <Box sx={cardSx}>
            <SectionTitle>Area Details</SectionTitle>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Diagram to replace, in Update Existing mode */}
              {isUpdate && (
                <FormControl fullWidth size="small">
                  <InputLabel id="existing-diagram-label">Diagram to Update</InputLabel>
                  <Select
                    labelId="existing-diagram-label"
                    value={existingDiagramId}
                    label="Diagram to Update"
                    onChange={(e) => setExistingDiagramId(e.target.value)}
                  >
                    {(existingDiagrams.data ?? []).map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.location?.name} / {d.subLocation?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Location Category Dropdown */}
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">Location Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={locationCategory}
                  label="Location Category"
                  onChange={(e) => setLocationCategory(e.target.value)}
                >
                  {locationSelector.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Area Dropdown (both modes) */}
              <FormControl fullWidth size="small">
                <InputLabel id="location-label">Area</InputLabel>
                <Select
                  labelId="location-label"
                  value={location}
                  label="Area"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {subLocationSelector.map((subLoc) => (
                    <MenuItem key={subLoc.id} value={subLoc.id}>
                      {subLoc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Checklist */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, py: 0.5 }}>
                {steps.map((step) => (
                  <Box key={step.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {step.done ? (
                      <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                    )}
                    <Typography variant="body2" color={step.done ? "text.primary" : "text.secondary"}>
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveArea}
                disabled={isPending}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                {isPending ? "Saving..." : isUpdate ? "Update Area" : "Save Area"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Image picker */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Select Plan Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pick an attachment type, then the image to crop the area from.
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenModal(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
            <InputLabel id="attachment-type-label">Attachment Type</InputLabel>
            <Select
              labelId="attachment-type-label"
              label="Attachment Type"
              value={selectedAttachmentType}
              onChange={(e) => setSelectedAttachmentType(e.target.value)}
            >
              {documentTypes.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!selectedAttachmentType ? (
            <Typography color="text.secondary" textAlign="center" py={5}>
              Choose an attachment type to see its images.
            </Typography>
          ) : loadingDocType ? (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={150} />
              ))}
            </Box>
          ) : docTypeError ? (
            <Typography color="error" textAlign="center" py={5}>
              Could not load the images.{" "}
              <Button size="small" onClick={() => refetchDocTypeDetails()}>
                Try again
              </Button>
            </Typography>
          ) : images.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={5}>
              No images for this attachment type on this vessel.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {images.map((image) => {
                const imageUrl = import.meta.env.VITE_API_URL + "/uploads/" + image.url;
                const current = openedImage?.id === image.id;
                return (
                  <Box
                    key={image.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setOpenedImage(image);
                      setSelectedImage(imageUrl);
                      setTimeout(() => {
                        setOpenModal(false);
                      }, 100);
                    }}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: current ? "primary.main" : "divider",
                      cursor: "pointer",
                      bgcolor: "#fff",
                      transition: "box-shadow 0.2s, border-color 0.2s",
                      "&:hover": { borderColor: "primary.light", boxShadow: "0 6px 16px rgba(13,71,161,0.15)" },
                    }}
                  >
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={image.fileName}
                      sx={{ display: "block", width: "100%", height: 110, objectFit: "cover", bgcolor: "#f1f5f9" }}
                    />
                    <Typography variant="caption" noWrap title={image.fileName} sx={{ display: "block", px: 1, py: 0.75 }}>
                      {image.fileName}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
    </OPPageContainer>
  );
};

export default CropLocationDiagram;
