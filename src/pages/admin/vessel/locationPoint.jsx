import React, { useState } from "react";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import {
  Box,
  Typography,
  Button,
  Grid,
  useMediaQuery,
  Paper,
} from "@mui/material";
import LocationPointTopBar from "../../../components/locationPointTopBar";
import { useTheme } from "@mui/material/styles";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
import Cropper from "react-cropper";
import useImageCropper from "../../../hooks/useImageCropper";

export default function LocationPoint() {
  const attachmentId = "20ceab7f-bfee-47b3-9989-eb572153fc57";
  const url =
    "https://raw.githubusercontent.com/roadmanfong/react-cropper/master/example/img/child.jpg";
  const imageCropper = useImageCropper({ url });

  const title = "Location Point";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State to handle drawer open/close
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <OPPageContainer sx={{ px: 2, pt: 2 }}>
      {/* Top Bar */}
      <LocationPointTopBar />

      {/* Title */}
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", color: "text.primary", px: 2, pt: 2 }}
      >
        {title}
      </Typography>
      <OPDivider sx={{ my: 2 }} />

      {/* Main Layout */}
      <Grid
        container
        spacing={2}
        sx={{ height: isMobile ? "auto" : "calc(100vh - 150px)" }}
      >
        {/* Left Section - Main Image Cropper */}
        <Grid item xs={12} md={9}>
          <Paper
            elevation={2}
            sx={{
              height: "100%",
              borderTop: `2px solid ${theme.palette.primary.main}`,
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 3 }}>{imageCropper.cropper}</Box>
          </Paper>
        </Grid>

        {/* Right Section - Location Details with Preview */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              height: "100%",
              borderTop: `2px solid ${theme.palette.primary.main}`,
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Location Details
            </Typography>

            {/* Preview now inside Location Details */}
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

            <OPDivider sx={{ my: 1 }} />

            {/* Location information */}
            {[
              "Location Category",
              "Location",
              "Check Point Number",
              "Sub Location",
              "Equipment",
              "Compartment",
              "Object",
              "Hazmat [ Quantity - Unit ]",
            ].map((text, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {text}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", color: "#0073E6" }}
                >
                  Not specified
                </Typography>
              </Box>
            ))}

            <Box sx={{ mt: "auto", pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                }}
                onClick={() => setOpenDrawer(true)}
              >
                Open Details
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Inventory Point Drawer */}
      <AddEditInventoryPointDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </OPPageContainer>
  );
}
