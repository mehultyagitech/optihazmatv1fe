import React, { useEffect } from "react";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";
import { Box, Typography, Button, Grid, useMediaQuery } from "@mui/material";
import LocationPointTopBar from "../../../components/locationPointTopBar";
import { useTheme } from "@mui/material/styles";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
import ImageViewer from "../../../components/ImageViewer";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import locationPointState, {
  selectedPinIdState,
} from "../../../utils/States/LocationDiagram";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import { locationPointAddDrawerState } from "../../../utils/States/LocationDiagram";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";

const DetailRow = ({ label, children }) => (
  <Box sx={{ mt: 1 }}>
    <Typography sx={{ color: "#0073E6" }}>{label}</Typography>
    <Typography sx={{ wordBreak: "break-word" }}>{children || "-"}</Typography>
  </Box>
);

export default function LocationPoint() {
  const navigate = useNavigate();
  const title = "Location Point";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [locationPoint, setLocationPoint] = useRecoilState(locationPointState);
  const [drawer, setDrawer] = useRecoilState(locationPointAddDrawerState);
  const [selectedPinId, setSelectedPinId] = useRecoilState(selectedPinIdState);
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

  // A selection belongs to one diagram; start clean when switching diagrams.
  useEffect(() => {
    setSelectedPinId("");
  }, [locationDiagramId, setSelectedPinId]);

  const url =
    locationDiagram.isPending || locationDiagram.isError
      ? "#"
      : import.meta.env.VITE_API_URL +
        "/uploads/" +
        locationDiagram.data.LocationDiagramImage[0].url;

  // Points come oldest first, so a point's position is its Check Point Number.
  const pins = locationDiagram.isSuccess ? locationDiagram.data.Pins ?? [] : [];
  const selectedIndex = pins.findIndex((p) => p.id === selectedPinId);
  const selectedPin = selectedIndex >= 0 ? pins[selectedIndex] : null;

  const hazmatText = (pin) =>
    (pin?.PinHazmat ?? [])
      .map((h) => `${h.hazmat?.name ?? "-"} [ ${h.totalMass ?? "-"} - ${h.unit?.name ?? "-"} ]`)
      .join(", ");

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
            overflowY: "auto",
          }}
        >
          <DetailRow label="Location Category :">
            {locationDiagram.isSuccess ? locationDiagram.data.location.name : "N/A"}
          </DetailRow>
          <DetailRow label="Location :">
            {locationDiagram.isSuccess ? locationDiagram.data.subLocation.name : "N/A"}
          </DetailRow>

          <OPDivider sx={{ my: 2 }} />

          {selectedPin ? (
            <>
              <DetailRow label="Check Point Number">{String(selectedIndex + 1)}</DetailRow>
              <DetailRow label="Sub Location">{selectedPin.subLocation?.name}</DetailRow>
              <DetailRow label="Equipment">{selectedPin.equipment?.name}</DetailRow>
              <DetailRow label="Compartment">{selectedPin.compartment?.name}</DetailRow>
              <DetailRow label="Object">{selectedPin.object?.name}</DetailRow>
              <DetailRow label="Hazmat [ Quantity - Unit ]">{hazmatText(selectedPin)}</DetailRow>
            </>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {pins.length
                ? "Click an inventory point on the diagram to see its details."
                : "No inventory points yet. Double-click the diagram to add one."}
            </Typography>
          )}

          {/* Open Details Button */}
          <Button
            variant="outlined"
            fullWidth
            disabled={!selectedPin}
            sx={{ mt: 3, borderColor: "#00AEEF", color: "#00AEEF" }}
            onClick={() => {
              setDrawer({
                open: true,
                x: selectedPin.x,
                y: selectedPin.y,
                pinId: selectedPin.id,
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
