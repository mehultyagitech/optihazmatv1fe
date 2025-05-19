import React, { useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import useImageCropper from "../../../hooks/useImageCropper";
import { useTheme } from "@mui/material/styles";

const CropLocationDiagram = () => {
  const theme = useTheme();
  const [mode, setMode] = useState("create");
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

  // mutation for saving the cropped image
  const { isPending, mutate, reset } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("vesselId", vesselView.id);
      formData.append("location", locationCategory);
      formData.append("subLocationId", location);
      formData.append("attachmentImageId", openedImage?.id);
      formData.append("attachmentId", openedImage?.attachmentId);
      formData.append("image", imageCropper.cropData);

      try {
        const response = await axiosInstance.post(
          `${process.env.REACT_APP_API_URL}/api/location-diagrams/${vesselView?.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      console.log("Image saved successfully", data);
    },
  });

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
        `${process.env.REACT_APP_API_URL}/api/document-types/${selectedAttachmentType}/${vesselView.id}`
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

            {/* Location Dropdown in Create Mode */}
            {mode === "create" && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  value={location}
                  label="Location"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {subLocationSelector.map((subLoc) => (
                    <MenuItem key={subLoc.id} value={subLoc.id}>
                      {subLoc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={mutate}
              disabled={isPending}
            >
              Save Area
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
                      process.env.REACT_APP_API_URL + "/uploads/" + image.url;

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
    </OPPageContainer>
  );
};

export default CropLocationDiagram;
