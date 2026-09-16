import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
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
import { useTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CropLocationDiagram = () => {
  const theme = useTheme();
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

  return (
    <OPPageContainer sx={{}}>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          <Typography variant="h6">
            <span style={{ color: "#00aaff" }}>Crop Location Diagram:</span>{" "}
            {vesselView?.name || "Unknown Vessel"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {!selectedImage ? (
              <Button variant="contained" onClick={() => setOpenModal(true)}>
                Select Image
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setSelectedImage(null);
                    imageCropper.resetCrop();
                    reset();
                  }}
                >
                  Clear Image
                </Button>
                <Button variant="outlined" onClick={imageCropper.rotateLeft}>
                  Rotate Left
                </Button>
                <Button variant="outlined" onClick={imageCropper.rotateRight}>
                  Rotate Right
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Box
            sx={{
              flex: 1,
              bgcolor: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Paper
              elevation={2}
              sx={{
                height: "100%",
                borderTop: `2px solid ${theme.palette.primary.main}`,
                p: 2,
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ mb: 3 }}>{imageCropper.cropper}</Box>
            </Paper>
          </Box>

          <Box sx={{ width: 300, borderLeft: "2px solid #a5d6a7", p: 2 }}>
            {/* Preview or Placeholder */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "text.secondary" }}
              >
                Preview
              </Typography>
              <Box
                className="img-preview-remote"
                sx={{
                  width: "100%",
                  height: "120px",
                  overflow: "hidden",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  mb: 1,
                }}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={imageCropper.getCroppedImage}
                fullWidth
                sx={{ mt: 1 }}
              >
                Crop Image
              </Button>
            </Box>

            {/* Mode Selection */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Mode</FormLabel>
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="create"
                  control={<Radio />}
                  label="Create New"
                />
                <FormControlLabel
                  value="update"
                  control={<Radio />}
                  label="Update Existing"
                />
              </RadioGroup>
            </FormControl>

            {/* Diagram to replace, in Update Existing mode */}
            {mode === "update" && (
              <FormControl fullWidth sx={{ mb: 2 }}>
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
            <FormControl fullWidth sx={{ mb: 2 }}>
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
            <FormControl fullWidth sx={{ mb: 2 }}>
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

            <Button
              variant="outlined"
              fullWidth
              onClick={handleSaveArea}
              disabled={isPending}
            >
              {isPending ? "Saving..." : mode === "update" ? "Update Area" : "Save Area"}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Attachment Type Selection</DialogTitle>
        <DialogContent>
          <Box border="1px solid limegreen" p={2} mb={2}>
            <Typography
              variant="subtitle1"
              sx={{ color: "green", fontWeight: 600 }}
            >
              Select Attachment Type
            </Typography>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="attachment-type-label">
                Attachment Type
              </InputLabel>
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
          </Box>

          <Box border="1px solid limegreen" p={2}>
            <Typography
              variant="subtitle1"
              sx={{ color: "green", fontWeight: 600 }}
            >
              Select Image for Area Cropping
            </Typography>

            <Box mt={2} display="flex" gap={2} flexWrap="wrap">
              {docTypeDetails?.map((docType) =>
                docType.VesselAttachments?.map((attachment) =>
                  attachment.AttachmentImages?.map((image) => {
                    const imageUrl =
                      import.meta.env.VITE_API_URL + "/uploads/" + image.url;

                    return (
                      <Box
                        key={image.id}
                        border="1px solid #ccc"
                        borderRadius={2}
                        p={1}
                        width={150}
                        textAlign="center"
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setOpenedImage(image);
                          setSelectedImage(imageUrl);
                          setTimeout(() => {
                            setOpenModal(false);
                          }, 100);
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={image.fileName}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                          }}
                        />
                        <Typography variant="caption" display="block" mt={1}>
                          {image.fileName}
                        </Typography>
                      </Box>
                    );
                  })
                )
              )}
            </Box>
          </Box>
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
