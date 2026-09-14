import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../api/axiosInstance";
import { commonVesselViewState, vesselState } from "../../../utils/States/Vessel";
import { getIHMReports } from "../../../api/services/ihmReport";
import { getPurchaseOrders } from "../../../api/services/poService";
import { downloadIHMMaintenanceCertificate } from "../../../utils/ihmCertificate";
import DiagramCard from "./vesselDasboardCard";
import AddEditVesselDrawer from "./addEditVesselDrawer";

const pieData = [
  { id: 1, value: 150, label: "Type 1", color: "#8BC34A" },
  { id: 2, value: 150, label: "Type 2", color: "#2196F3" },
  { id: 3, value: 40, label: "Type 3", color: "#BDBDBD" },
];

const barData = [
  { label: "Hazmat Free Items", value: 130 },
  { label: "Prohibited Items", value: 20 },
  { label: "Not installed Hazmat Items", value: 80 },
  { label: "Installed Hazmat Items", value: 120 },
  { label: "Replaced Items", value: 9 },
];

const SectionHeader = ({ title, subtitle, color }) => (
  <Box
    sx={{
      px: 3,
      py: 1.5,
      display: "flex",
      alignItems: "baseline",
      flexWrap: "wrap",
      columnGap: 1,
      borderLeft: `5px solid ${color}`,
      bgcolor: `${color}14`,
    }}
  >
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const Section = ({ children, ...header }) => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
  >
    <SectionHeader {...header} />
    <Divider />
    <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
  </Paper>
);

const heroButtonSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.6)",
  textTransform: "none",
  fontWeight: 600,
  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
};

const hasHazmatItem = (po) =>
  (po.items || []).some((item) => String(item.canContainHazmat).toUpperCase() === "YES");

const VesselDashboard = () => {
  const navigate = useNavigate();
  const vessel = useRecoilValue(commonVesselViewState);
  const setVesselDrawer = useSetRecoilState(vesselState);
  const [poOpen, setPoOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [expandedPo, setExpandedPo] = useState(null);

  const vesselInfo = useQuery({
    queryKey: ["vesselInfo", vessel.id],
    queryFn: async () => (await axiosInstance.get(`/vessels/${vessel.id}`)).data.data,
    enabled: !!vessel.id,
  });

  // IHM Maintenance Certificate PDF from the full vessel record.
  const certificateMutation = useMutation({
    mutationFn: async () => (await axiosInstance.get(`/vessels/${vessel.id}`)).data.data,
    onSuccess: (vesselData) => downloadIHMMaintenanceCertificate(vesselData),
    onError: (error) => {
      console.error("Failed to generate IHM Maintenance Certificate:", error);
      toast.error("Could not generate the certificate. Please try again.");
    },
  });

  // IHM Report: download the latest approved report. The tab is opened on the
  // click itself so the browser doesn't block it as a pop-up.
  const reportMutation = useMutation({
    mutationFn: async () => getIHMReports(vessel.id),
    onSuccess: (res, reportWindow) => {
      const reports = (res?.data?.reports ?? []).filter((r) => r.fileUrl && !r.disabled);
      const latestApproved = reports
        .filter((r) => r.approved)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (!latestApproved) {
        reportWindow?.close();
        toast.info(
          reports.length
            ? "No approved IHM report yet. Approve one in Generate IHM to download it here."
            : "No IHM report has been generated for this vessel yet."
        );
        return;
      }
      const url = `${import.meta.env.VITE_API_URL}/uploads/${latestApproved.fileUrl}`;
      if (reportWindow) reportWindow.location.href = url;
      else window.open(url, "_blank");
    },
    onError: (error, reportWindow) => {
      reportWindow?.close();
      toast.error(error?.message || "Could not load the IHM reports");
    },
  });

  const dashboard = useQuery({
    queryKey: ["vesselDashboard", vessel.id],
    queryFn: async () =>
      (await axiosInstance.get(`/getAllDashboardData/getAllVesselDashboardData/${vessel.id}`))
        .data.overview,
    enabled: !!vessel.id,
  });

  const locationDiagrams = useQuery({
    queryKey: ["dashboardLocationDiagrams", vessel.id],
    queryFn: async () =>
      (await axiosInstance.get(`/location-diagrams/${vessel.id}`, { params: { limit: 1000 } })).data,
    select: (data) =>
      data.data.locationDiagrams.map((diagram) => ({
        id: diagram.id,
        locationName: diagram.location?.name,
        subLocationName: diagram.subLocation?.name,
        imageUrl: diagram.LocationDiagramImage[0]?.url,
        userName: diagram.user?.name,
        pinCounts: diagram.pinCounts,
      })),
    enabled: !!vessel.id,
  });

  // POs are linked by vessel, or by IMO when uploaded before the link existed.
  const imo = vesselInfo.data?.imoNumber;
  const purchaseOrders = useQuery({
    queryKey: ["vesselPurchaseOrders", vessel.id, imo],
    queryFn: async () => {
      const requests = [getPurchaseOrders({ vesselId: vessel.id })];
      if (imo) requests.push(getPurchaseOrders({ imo }));
      const results = await Promise.all(requests);
      const byId = new Map();
      results.forEach((res) =>
        (res?.data?.purchaseOrders ?? []).forEach((po) => byId.set(po.id, po))
      );
      return [...byId.values()];
    },
    enabled: poOpen && !!vessel.id,
  });

  const filteredPos = useMemo(() => {
    const query = poSearch.trim().toLowerCase();
    const list = purchaseOrders.data ?? [];
    if (!query) return list;
    return list.filter((po) =>
      [
        po.poNumber,
        po.supplier,
        po.referenceNumber,
        po.orderDate,
        po.docStatus,
        ...(po.items || []).flatMap((item) => [item.product, item.brand, item.partDescription]),
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [purchaseOrders.data, poSearch]);

  const overview = dashboard.data;
  const part1 = [
    { code: "i-1", title: "Paints and Coating Systems", icon: FormatPaintIcon, color: "#43a047", count: overview?.i1InventoryPts, to: "?inventoryType=i1" },
    { code: "i-2", title: "Equipment and Machinery", icon: PrecisionManufacturingIcon, color: "#1e88e5", count: overview?.i2InventoryPts, to: "?inventoryType=i2" },
    { code: "i-3", title: "Structure and Hull", icon: DirectionsBoatIcon, color: "#00897b", count: overview?.i3InventoryPts, to: "?inventoryType=i3" },
    { code: "Rp", title: "Replaced Items", icon: SwapHorizIcon, color: "#fb8c00", count: overview?.replacedItems, to: "?status=Replaced" },
    { code: "Rm", title: "Removed Items", icon: RemoveCircleOutlineIcon, color: "#e53935", count: overview?.removedItems, to: "?status=Removed" },
  ];

  const info = vesselInfo.data;
  const diagrams = locationDiagrams.data ?? [];

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 }, background: "#f4f6fa", minHeight: "100vh" }}>
        {/* Vessel header + actions */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #26a69a 100%)",
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
            <Box sx={{ minWidth: 0 }}>
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/vessels/vessels")}
                sx={{ ...heroButtonSx, mb: 1, px: 0, "&:hover": { bgcolor: "transparent" } }}
              >
                All Vessels
              </Button>
              <Typography variant="h5" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                {info?.vesselName || vessel.name || "Vessel Dashboard"}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {[
                  info?.imoNumber && `IMO ${info.imoNumber}`,
                  info?.vesselType,
                  info?.flag && `Flag: ${info.flag}`,
                  info?.ihmClass,
                ]
                  .filter(Boolean)
                  .map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 500 }}
                    />
                  ))}
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1.5}>
              <Button
                variant="outlined"
                startIcon={<InfoOutlinedIcon />}
                sx={heroButtonSx}
                disabled={!vessel.id}
                onClick={() => setVesselDrawer({ id: vessel.id, open: true })}
              >
                Vessel Info
              </Button>
              <Button
                variant="outlined"
                startIcon={<WorkspacePremiumIcon />}
                sx={heroButtonSx}
                onClick={() => certificateMutation.mutate()}
                disabled={!vessel.id || certificateMutation.isPending}
              >
                {certificateMutation.isPending ? "Generating..." : "IHM Maintenance Certificate"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                sx={heroButtonSx}
                disabled={!vessel.id || reportMutation.isPending}
                onClick={() => reportMutation.mutate(window.open("", "_blank"))}
              >
                {reportMutation.isPending ? "Loading..." : "IHM Report"}
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={!vessel.id}
                onClick={() => setPoOpen(true)}
                sx={{
                  bgcolor: "#fff",
                  color: "#0d47a1",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#e3f2fd" },
                }}
              >
                Search PO
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box display="flex" flexDirection="column" gap={3}>
          {/* PO summaries */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Section title="PO's Review Summary" color="#2196F3">
                <PieChart
                  skipAnimation
                  series={[{ data: pieData, innerRadius: 50, outerRadius: 90 }]}
                  height={210}
                />
                <Typography variant="caption" display="block" align="right" color="text.secondary">
                  (Click to view details)
                </Typography>
              </Section>
            </Grid>
            <Grid item xs={12} md={7}>
              <Section title="Items from 1 POs containing Hazmat" color="#2196F3">
                <BarChart
                  skipAnimation
                  xAxis={[{ scaleType: "band", data: barData.map((item) => item.label) }]}
                  series={[{ data: barData.map((item) => item.value), color: "#2979FF" }]}
                  height={230}
                />
                <Typography variant="caption" display="block" align="right" color="primary">
                  (Click <span style={{ textDecoration: "underline" }}>Blue colored text</span> to view item details)
                </Typography>
              </Section>
            </Grid>
          </Grid>

          {/* IHM Part 1 */}
          <Section
            title="IHM Part 1 Summary Data"
            subtitle="(Initial IHM Part 1 + Installed Items - Replaced Items - Removed Items)"
            color="#1976d2"
          >
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
              }}
            >
              {part1.map(({ code, title, icon: Icon, color, count, to }) => (
                <Card
                  key={code}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderTop: `4px solid ${color}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: `0 10px 22px ${color}33` },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/vessels/inventory-points${to}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: `${color}1f`,
                            color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon />
                        </Box>
                        <Chip label={code} size="small" sx={{ bgcolor: `${color}1f`, color, fontWeight: 700 }} />
                      </Box>
                      <Typography variant="h4" fontWeight={700} mt={2}>
                        {dashboard.isPending ? <Skeleton width={48} /> : count ?? "-"}
                      </Typography>
                      <Typography fontSize={14} fontWeight={600} color="text.secondary">
                        {title}
                      </Typography>
                      <Typography variant="caption" color={color} fontWeight={600}>
                        View items →
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Section>

          {/* Location diagrams */}
          <Section
            title="Location Diagrams"
            subtitle="(Initial IHM Part 1 + Installed Items containing Hazmat)"
            color="#43a047"
          >
            {locationDiagrams.isPending ? (
              <Grid container spacing={2}>
                {[0, 1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton variant="rounded" height={300} />
                  </Grid>
                ))}
              </Grid>
            ) : diagrams.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary" mb={2}>
                  No location diagrams yet.
                </Typography>
                <Button variant="outlined" onClick={() => navigate("/vessels/new-area")}>
                  Add Location Diagram
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {diagrams.map((diagram) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={diagram.id}>
                    <DiagramCard
                      diagram={diagram}
                      avatarSrc={
                        diagram.imageUrl
                          ? `${import.meta.env.VITE_API_URL}/uploads/${diagram.imageUrl}`
                          : undefined
                      }
                      onOpen={() => navigate(`/vessels/inventory-points/${diagram.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Section>
        </Box>
      </Box>

      {/* Search PO */}
      <Dialog open={poOpen} onClose={() => setPoOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Search PO
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Purchase orders for {info?.vesselName || vessel.name}
            </Typography>
          </Box>
          <IconButton onClick={() => setPoOpen(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="PO number, supplier, reference no, product..."
            value={poSearch}
            onChange={(e) => setPoSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {purchaseOrders.isPending ? (
            <Skeleton variant="rounded" height={160} />
          ) : purchaseOrders.isError ? (
            <Typography color="error">Could not load purchase orders.</Typography>
          ) : filteredPos.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              {(purchaseOrders.data ?? []).length
                ? "No purchase orders match your search."
                : "No purchase orders found for this vessel."}
            </Typography>
          ) : (
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell />
                    {["PO No", "Supplier", "Order Date", "Received", "Reference No", "Items", "Hazmat Expected", "Doc Status"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPos.map((po) => {
                    const open = expandedPo === po.id;
                    return [
                      <TableRow key={po.id} hover sx={{ cursor: "pointer" }} onClick={() => setExpandedPo(open ? null : po.id)}>
                        <TableCell padding="checkbox">
                          {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{po.poNumber}</TableCell>
                        <TableCell>{po.supplier || "-"}</TableCell>
                        <TableCell>{po.orderDate || "-"}</TableCell>
                        <TableCell>{po.orderRcvDate || "-"}</TableCell>
                        <TableCell>{po.referenceNumber || "-"}</TableCell>
                        <TableCell>{(po.items || []).length}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={hasHazmatItem(po) ? "YES" : "NO"}
                            color={hasHazmatItem(po) ? "warning" : "default"}
                          />
                        </TableCell>
                        <TableCell>{po.docStatus || "-"}</TableCell>
                      </TableRow>,
                      open && (
                        <TableRow key={`${po.id}-items`}>
                          <TableCell colSpan={9} sx={{ bgcolor: "#fafafa" }}>
                            {(po.items || []).length === 0 ? (
                              <Typography variant="body2" color="text.secondary">No items on this PO.</Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    {["Product", "Brand", "Part Description", "Qty", "Unit", "Can Contain Hazmat"].map((h) => (
                                      <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {po.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.product || "-"}</TableCell>
                                      <TableCell>{item.brand || "-"}</TableCell>
                                      <TableCell>{item.partDescription || "-"}</TableCell>
                                      <TableCell>{item.qtyRcv || "-"}</TableCell>
                                      <TableCell>{item.unit || "-"}</TableCell>
                                      <TableCell>{item.canContainHazmat || "NO"}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    ];
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* The vessel drawer opens from the shared vessel state. */}
      <AddEditVesselDrawer />
      {/* Outside the drawer: it unmounts on save, and the success toast
          must outlive it. */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default VesselDashboard;
