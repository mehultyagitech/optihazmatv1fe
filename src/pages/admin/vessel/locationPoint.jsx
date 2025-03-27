import React, { useState } from "react";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import { Box, Typography, Button, Grid, useMediaQuery } from "@mui/material";
import LocationPointTopBar from "../../../components/locationPointTopBar";
import { useTheme } from "@mui/material/styles";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer"; // Import the drawer component

export default function LocationPoint() {
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
        sx={{ height: isMobile ? "auto" : "calc(100vh - 150px)", flexDirection: isMobile ? "column" : "row" }}
      >
        {/* Left Section - Image / Floor Plan */}
        <Grid 
          item 
          xs={12} 
          md={9} 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            bgcolor: "#EAEAEA", 
            p: 2,
          }}
        >
          <Box
            component="img"
            src="/image.png" // Update with actual image source
            alt="Blueprint"
            sx={{
              maxWidth: "100%",
              maxHeight: "90%",
              border: "2px solid #ccc",
              borderRadius: "8px",
              width: isMobile ? "90%" : "auto",
              height: isMobile ? "auto" : "100%",
            }}
          />
        </Grid>

        {/* Right Section - Location Details */}
        <Grid 
          item 
          xs={12} 
          md={3} 
          sx={{
            bgcolor: "white",
            borderLeft: isMobile ? "none" : "2px solid #00AEEF",
            borderTop: isMobile ? "2px solid #00AEEF" : "none",
            p: 2,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {[
            "Location Category", "Location", "Check Point Number", "Sub Location", 
            "Equipment", "Compartment", "Object", "Hazmat [ Quantity - Unit ]"
          ].map((text, index) => (
            <Typography key={index} sx={{ color: "#0073E6", mt: index === 0 ? 1 : 0.5 }}>
              {text}
            </Typography>
          ))}

          {/* Open Details Button */}
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 3, borderColor: "#00AEEF", color: "#00AEEF" }}
            onClick={() => setOpenDrawer(true)} // Open Drawer on Click
          >
            Open Details
          </Button>
        </Grid>
      </Grid>

      {/* Inventory Point Drawer */}
      <AddEditInventoryPointDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </OPPageContainer>
  );
}
