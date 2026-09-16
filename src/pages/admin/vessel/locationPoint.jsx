import { useEffect } from "react";
import OPPageContainer from "../../../components/OPPageContainer";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RoomIcon from "@mui/icons-material/Room";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DetailRow = ({ label, children }) => (
  <Box sx={{ py: 1, "&:not(:last-of-type)": { borderBottom: "1px dashed", borderColor: "divider" } }}>
    <Typography variant="caption" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
      {children || "-"}
    </Typography>
  </Box>
);

const cardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "#fff",
  overflow: "hidden",
};

export default function LocationPoint() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
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

      setLocationPoint(() => response.data.data);
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

  const objectText = (pin) =>
    pin?.object?.name ||
    [...new Set((pin?.PinHazmat ?? []).map((h) => h.object?.name).filter(Boolean))].join(", ");

  const statusOf = (pin) => (pin.isRemovedFromIHM ? "Removed" : pin.isReplaced ? "Replaced" : "Active");

  const openDetails = () =>
    setDrawer({
      open: true,
      x: selectedPin.x,
      y: selectedPin.y,
      pinId: selectedPin.id,
    });

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
              Location Point
            </Typography>
            {locationDiagram.isSuccess ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.75 }}>
                <Chip size="small" label={`Location Category: ${locationDiagram.data.location?.name ?? "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip size="small" label={`Area: ${locationDiagram.data.subLocation?.name ?? "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
              </Box>
            ) : (
              <Skeleton width={260} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography variant="h4" fontWeight={700} lineHeight={1}>
            {pins.length}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Check Point{pins.length === 1 ? "" : "s"}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gap: 3,
      // Side by side only when the plan still gets its full 800px viewer:
      // points are stored as a share of that box.
      gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 340px" }, alignItems: "start" }}>
        {/* Plan with points */}
        <Box sx={cardSx}>
          <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid", borderColor: "divider", flexWrap: "wrap" }}>
            <TouchAppIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              <b>Double-click</b> the plan to add an inventory point · <b>click</b> a point to see it ·{" "}
              <b>double-click</b> a point to edit it
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#eef2f6", p: { xs: 1, md: 2 } }}>
            {locationDiagram.isPending ? (
              <Skeleton variant="rounded" width="100%" height={500} />
            ) : locationDiagram.isError ? (
              <Typography color="error" sx={{ py: 10 }}>
                Could not load this location diagram.
              </Typography>
            ) : (
              <ImageViewer
                imageUrl={url}
                locationPoint={locationDiagram.data}
              />
            )}
          </Box>
        </Box>

        {/* Side panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={cardSx}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography fontWeight={700} fontSize={15}>
                {selectedPin ? `Check Point ${selectedIndex + 1}` : "Point Details"}
              </Typography>
              {selectedPin && (
                <Chip size="small" label={statusOf(selectedPin)} color={statusOf(selectedPin) === "Active" ? "success" : "warning"} variant="outlined" />
              )}
            </Box>
            <Box sx={{ px: 2, py: 1 }}>
              {selectedPin ? (
                <>
                  <DetailRow label="Check Point Number">{String(selectedIndex + 1)}</DetailRow>
                  <DetailRow label="Sub Location">{selectedPin.subLocation?.name}</DetailRow>
                  <DetailRow label="Equipment">{selectedPin.equipment?.name}</DetailRow>
                  <DetailRow label="Compartment">{selectedPin.compartment?.name}</DetailRow>
                  <DetailRow label="Object">{objectText(selectedPin)}</DetailRow>
                  <DetailRow label="Hazmat [ Quantity - Unit ]">{hazmatText(selectedPin)}</DetailRow>
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                  <RoomIcon sx={{ fontSize: 40, color: "#b0bec5" }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {pins.length
                      ? "Click an inventory point on the diagram to see its details."
                      : "No inventory points yet. Double-click the diagram to add one."}
                  </Typography>
                </Box>
              )}
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<OpenInNewIcon />}
                disabled={!selectedPin}
                onClick={openDetails}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Open Details
              </Button>
            </Box>
          </Box>

          {pins.length > 0 && (
            <Box sx={cardSx}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography fontWeight={700} fontSize={15}>
                  All Check Points
                </Typography>
              </Box>
              <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
                {pins.map((pin, index) => (
                  <ListItemButton
                    key={pin.id}
                    selected={pin.id === selectedPinId}
                    onClick={() => setSelectedPinId(pin.id)}
                    sx={{ gap: 1.5, py: 1 }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        bgcolor: pin.id === selectedPinId ? "#e53935" : "#31a640",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {pin.subLocation?.name || "-"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {pin.equipment?.name || "-"}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>

      {/* Inventory Point Drawer */}
      <AddEditInventoryPointDrawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, x: 0, y: 0, pinId: "" })}
      />
      {/* Outside the drawer so the save message survives it closing. */}
      <ToastContainer position="top-right" autoClose={3000} />
    </OPPageContainer>
  );
}
