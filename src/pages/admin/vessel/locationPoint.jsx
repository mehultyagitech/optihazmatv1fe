import React, { useState } from "react";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import { Box, Typography, Button, Grid, useMediaQuery } from "@mui/material";
import LocationPointTopBar from "../../../components/locationPointTopBar";
import { useTheme } from "@mui/material/styles";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
import ImageViewer from "../../../components/ImageViewer";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import locationPointState from "../../../utils/States/LocationDiagram";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import { locationPointAddDrawerState } from "../../../utils/States/LocationDiagram";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";

export default function LocationPoint() {
  const navigate = useNavigate();
  const title = "Location Point";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [locationPoint, setLocationPoint] = useRecoilState(locationPointState);
  const [drawer, setDrawer] = useRecoilState(locationPointAddDrawerState);
  const { locationDiagramId } = useParams();
  const commonVesselView = useRecoilValue(commonVesselViewState);

  const locationDiagram = useQuery({
    queryKey: ["locationDiagram", locationDiagramId, commonVesselView.id],
    queryFn: async () => {
      if (!locationDiagramId || !commonVesselView.id) {
        navigate("/vessels/vessels");
      }
      const response = await axiosInstance.get(
        `/location-diagrams/${commonVesselView.id}/${locationDiagramId}`
      );

      setLocationPoint((prev) => response.data.data);
      return response.data;
    },
    enabled: !!locationDiagramId,
    select: (data) => data.data,
  });

  const url =
    locationDiagram.isPending || locationDiagram.isError
      ? "#"
      : import.meta.env.VITE_API_URL +
        "/uploads/" +
        locationDiagram.data.LocationDiagramImage[0].url;

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
        sx={{
          height: isMobile ? "auto" : "calc(100vh - 150px)",
          flexDirection: isMobile ? "column" : "row",
        }}
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
          <ImageViewer
            imageUrl={url}
            locationPoint={
              locationDiagram.isSuccess ? locationDiagram.data : {}
            }
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
          <Typography key={7} sx={{ color: "#0073E6", mt: 1 }}>
            Location Category :
          </Typography>
          <Typography key={8} sx={{ mt: 1 }}>
            {locationDiagram.isSuccess
              ? locationDiagram.data.location.name
              : "N/A"}
          </Typography>
          <Typography key={9} sx={{ color: "#0073E6", mt: 1 }}>
            Location :
          </Typography>
          <Typography key={10} sx={{ mt: 1 }}>
            {locationDiagram.isSuccess
              ? locationDiagram.data.subLocation.name
              : "N/A"}
          </Typography>
          {[
            "Check Point Number",
            "Sub Location",
            "Equipment",
            "Compartment",
            "Object",
            "Hazmat [ Quantity - Unit ]",
          ].map((text, index) => (
            <Typography
              key={index}
              sx={{ color: "#0073E6", mt: index === 0 ? 1 : 0.5 }}
            >
              {text}
            </Typography>
          ))}

          {/* Open Details Button */}
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 3, borderColor: "#00AEEF", color: "#00AEEF" }}
            onClick={() => {
              setDrawer({
                open: true,
                x: 0,
                y: 0,
                pinId: "",
              });
            }}
          >
            Open Details
          </Button>
        </Grid>
      </Grid>

      {/* Inventory Point Drawer */}
      <AddEditInventoryPointDrawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, x: 0, y: 0, pinId: "" })}
      />
    </OPPageContainer>
  );
}
