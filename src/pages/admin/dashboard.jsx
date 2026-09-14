import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import InventoryIcon from "@mui/icons-material/Inventory";
import MapIcon from "@mui/icons-material/Map";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupsIcon from "@mui/icons-material/Groups";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as XLSX from "xlsx";
import OPPageContainer from "../../components/OPPageContainer";
import axiosInstance from "../../api/axiosInstance";
import { ClientSelector, ManagerSelector } from "../../utils/States/Generic";
import { commonVesselViewState } from "../../utils/States/Vessel";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

// No data behind these yet, so they stay as the original sample content.
const DATA_SUBMIT_SAMPLE = [
  { label: "Vessel Submitted Data", value: "2,221" },
  { label: "Vessel Data Pending", value: "203" },
  { label: "Last Submitted In", value: "July, 2024" },
];
const SUPPLIER_SAMPLE_ROWS = [
  { id: 1, supplierNotCooperatingDetails: "IT Rack UPS 1 (Next Gen and NET SWAN)", emailCommunications: "test@gmail.com", status: false, client: "ACECHEM Shipping Pte Ltd", fleetManager: "Neptune Ship Management", vessel: "A LA MARINE" },
  { id: 2, supplierNotCooperatingDetails: "IT Rack UPS 2 (Next Gen and NET SWAN)", emailCommunications: "test@gmail.com", status: true, client: "ACECHEM Shipping Pte Ltd", fleetManager: "Neptune Ship Management", vessel: "A LA MARINE" },
  { id: 3, supplierNotCooperatingDetails: "Battery- Auxiliary Engine 1", emailCommunications: "test@gmail.com", status: false, client: "Blue Ocean Chemicals", fleetManager: "Anchor Marine Mgmt", vessel: "PACIFIC NAVIGATOR" },
];

const STATUS_COLORS = {
  Active: "success",
  "Ready for Maintenance": "info",
  Discontinued: "default",
};

const StatTile = ({ icon: Icon, label, value, sub, color, loading }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      boxSizing: "border-box",
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      gap: 2,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": { transform: "translateY(-3px)", boxShadow: `0 10px 22px ${color}2e` },
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: 2.5,
        flexShrink: 0,
        bgcolor: `${color}1a`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
        {loading ? <Skeleton width={40} /> : value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {loading ? <Skeleton width={90} /> : sub}
        </Typography>
      )}
    </Box>
  </Card>
);

const Panel = ({ title, subtitle, color = "#1976d2", badge, children }) => (
  <Paper
    elevation={0}
    sx={{
      height: "100%",
      boxSizing: "border-box",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        borderLeft: `4px solid ${color}`,
        bgcolor: `${color}0f`,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
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
      {badge && <Chip size="small" label={badge} sx={{ ml: "auto" }} />}
    </Box>
    <Divider />
    <Box sx={{ p: 2.5, flexGrow: 1 }}>{children}</Box>
  </Paper>
);

const MetricRow = ({ label, value, color, dot, loading }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    gap={2}
    py={1}
    sx={{ "&:not(:last-of-type)": { borderBottom: "1px dashed", borderColor: "divider" } }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {dot && <Box component="span" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />}
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={700} color={color || "text.primary"}>
      {loading ? <Skeleton width={32} /> : value}
    </Typography>
  </Box>
);

// CSS grid instead of MUI Grid: Grid's negative margins pulled the panels up
// into the stat tiles. `span` turns { xs: 12, md: 5 } into grid-column spans.
const span = (breakpoints) =>
  Object.fromEntries(Object.entries(breakpoints).map(([bp, n]) => [bp, `span ${n}`]));

const selectSx = {
  minWidth: 180,
  "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const clients = useRecoilValue(ClientSelector) ?? [];
  const managers = useRecoilValue(ManagerSelector) ?? [];
  const setCommonVesselView = useSetRecoilState(commonVesselViewState);
  const [filters, setFilters] = useState({ clientId: "", managerId: "", vesselId: "" });

  const overview = useQuery({
    queryKey: ["fleetOverview", filters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const response = await axiosInstance.get("/getAllDashboardData", { params });
      return response.data.overview;
    },
    // Keep the old numbers on screen while a filter change loads.
    placeholderData: (previous) => previous,
  });

  const data = overview.data;
  const loading = overview.isPending;
  const vessels = data?.vessels ?? {};
  const inventory = data?.inventory ?? {};
  const pos = data?.purchaseOrders ?? {};
  const reports = data?.ihmReports ?? {};
  const vesselList = useMemo(() => data?.vesselList ?? [], [data]);
  const topHazmats = data?.topHazmats ?? [];
  const maxHazmat = Math.max(1, ...topHazmats.map((h) => h.count));
  const hasFilters = Object.values(filters).some(Boolean);

  const setFilter = (name) => (e) => setFilters((prev) => ({ ...prev, [name]: e.target.value }));

  const openVessel = (row) => {
    setCommonVesselView({ id: row.id, name: row.vesselName });
    navigate("/vessels/vesselDashboard");
  };

  const exportVesselList = () => {
    const sheet = XLSX.utils.json_to_sheet(
      vesselList.map((v) => ({
        Vessel: v.vesselName,
        "IMO Number": v.imoNumber,
        Client: v.client ?? "",
        "Fleet Manager": v.manager ?? "",
        "Vessel Type": v.vesselType ?? "",
        "IHM Class": v.ihmClass ?? "",
        Status: v.status,
        "Inventory Points": v.points,
        "On Board": v.onBoard,
        "Removed / Replaced": v.removedReplaced,
        "Location Diagrams": v.locationDiagrams,
        "IHM Reports": v.ihmReports,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Vessels");
    XLSX.writeFile(workbook, "Vessel_List.xlsx");
  };

  const vesselPie = [
    { id: "active", label: "Active", value: Math.max(0, (vessels.active ?? 0) - (vessels.readyForMaintenance ?? 0)), color: "#43a047" },
    { id: "rfm", label: "Ready for Maintenance", value: vessels.readyForMaintenance ?? 0, color: "#1e88e5" },
    { id: "disc", label: "Discontinued", value: vessels.discontinued ?? 0, color: "#b0bec5" },
  ];

  const inventoryBars = [
    { label: "i-1", value: inventory.i1 ?? 0, color: "#43a047" },
    { label: "i-2", value: inventory.i2 ?? 0, color: "#1e88e5" },
    { label: "i-3", value: inventory.i3 ?? 0, color: "#00897b" },
    { label: "Replaced", value: inventory.replaced ?? 0, color: "#fb8c00" },
    { label: "Removed", value: inventory.removed ?? 0, color: "#e53935" },
  ];

  const vesselColumns = [
    {
      field: "vesselName",
      headerName: "Vessel",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary" sx={{ lineHeight: "inherit" }}>
          {params.value}
        </Typography>
      ),
    },
    { field: "imoNumber", headerName: "IMO", minWidth: 110 },
    { field: "client", headerName: "Client", flex: 1, minWidth: 140 },
    { field: "manager", headerName: "Fleet Manager", flex: 1, minWidth: 140 },
    { field: "vesselType", headerName: "Vessel Type", flex: 1, minWidth: 160 },
    { field: "ihmClass", headerName: "IHM Class", minWidth: 100 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 170,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={STATUS_COLORS[params.value] ?? "default"} variant="outlined" />
      ),
    },
    { field: "points", headerName: "Inventory Pts", type: "number", minWidth: 110 },
    { field: "onBoard", headerName: "On Board", type: "number", minWidth: 90 },
    { field: "locationDiagrams", headerName: "Diagrams", type: "number", minWidth: 90 },
    { field: "ihmReports", headerName: "IHM Reports", type: "number", minWidth: 100 },
  ];

  const supplierColumns = [
    { field: "vessel", headerName: "Vessel", width: 180 },
    { field: "client", headerName: "Client", width: 200 },
    { field: "supplierNotCooperatingDetails", headerName: "Supplier Not Cooperating Details", width: 340 },
    { field: "emailCommunications", headerName: "Email Communications", width: 240 },
    { field: "status", headerName: "Status", width: 120 },
  ];

  return (
    <OPPageContainer sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 4, bgcolor: "#f4f6fa", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* Header + filters */}
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
        <Box display="flex" flexWrap="wrap" alignItems="flex-end" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Fleet Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              IHM status across {hasFilters ? "the selected" : "all"} vessels
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
            <TextField select size="small" label="Client" value={filters.clientId} onChange={setFilter("clientId")} sx={selectSx}>
              <MenuItem value="">All Clients</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.companyName}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Fleet Manager" value={filters.managerId} onChange={setFilter("managerId")} sx={selectSx}>
              <MenuItem value="">All Fleet Managers</MenuItem>
              {managers.map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.companyName}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Vessel" value={filters.vesselId} onChange={setFilter("vesselId")} sx={selectSx}>
              <MenuItem value="">All Vessels</MenuItem>
              {(data?.filterOptions?.vessels ?? []).map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
              ))}
            </TextField>
            {hasFilters && (
              <Button
                startIcon={<RestartAltIcon />}
                onClick={() => setFilters({ clientId: "", managerId: "", vesselId: "" })}
                sx={{ color: "#fff", textTransform: "none", fontWeight: 600 }}
              >
                Reset
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              disabled={!vesselList.length}
              onClick={exportVesselList}
              sx={{ bgcolor: "#fff", color: "#0d47a1", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#e3f2fd" } }}
            >
              Vessel List
            </Button>
          </Box>
        </Box>
        {overview.isFetching && !loading && (
          <LinearProgress sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.25)", "& .MuiLinearProgress-bar": { bgcolor: "#fff" } }} />
        )}
      </Paper>

      {overview.isError && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "error.light", display: "flex", gap: 1, alignItems: "center" }}>
          <WarningAmberIcon color="error" />
          <Typography color="error">Could not load the dashboard data. Please refresh the page.</Typography>
        </Paper>
      )}

      {/* KPI tiles */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 3,
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))",
        }}
      >
        <StatTile icon={DirectionsBoatIcon} color="#1976d2" label="Vessels" value={vessels.total ?? 0} sub={`${vessels.active ?? 0} active · ${vessels.discontinued ?? 0} discontinued`} loading={loading} />
        <StatTile icon={InventoryIcon} color="#43a047" label="Inventory Points" value={inventory.total ?? 0} sub={`${inventory.onBoard ?? 0} on board`} loading={loading} />
        <StatTile icon={MapIcon} color="#00897b" label="Location Diagrams" value={data?.locationDiagrams ?? 0} sub="Across the fleet" loading={loading} />
        <StatTile icon={ShoppingCartIcon} color="#fb8c00" label="Purchase Orders" value={pos.total ?? 0} sub={`${pos.withHazmat ?? 0} may contain hazmat`} loading={loading} />
        <StatTile icon={DescriptionIcon} color="#8e24aa" label="IHM Reports" value={reports.total ?? 0} sub={`${reports.approved ?? 0} approved`} loading={loading} />
        <StatTile icon={GroupsIcon} color="#546e7a" label="Clients / Managers" value={`${data?.totalClients ?? 0} / ${data?.totalManagers ?? 0}`} sub="Registered companies" loading={loading} />
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
        {/* Vessel overview */}
        <Box sx={{ gridColumn: span({ xs: 12, md: 5 }) }}>
          <Panel title="Vessel Overview" color="#1976d2">
            {!loading && !vessels.total ? (
              <Typography color="text.secondary" textAlign="center" py={6}>No vessels match these filters.</Typography>
            ) : (
              <PieChart
                skipAnimation
                series={[{ data: vesselPie, innerRadius: 55, outerRadius: 95, paddingAngle: 2, cornerRadius: 4 }]}
                height={220}
                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                slotProps={{ legend: { hidden: true } }}
              />
            )}
            <Divider sx={{ my: 1 }} />
            <MetricRow label="Total Registered Vessels" value={vessels.total ?? 0} loading={loading} />
            <MetricRow label="Total Active Vessels" value={vessels.active ?? 0} color="success.main" dot="#43a047" loading={loading} />
            <MetricRow label="Ready for Maintenance" value={vessels.readyForMaintenance ?? 0} color="info.main" dot="#1e88e5" loading={loading} />
            <MetricRow label="Total Inactive (Discontinued) Vessels" value={vessels.discontinued ?? 0} dot="#b0bec5" loading={loading} />
          </Panel>
        </Box>

        {/* IHM inventory summary */}
        <Box sx={{ gridColumn: span({ xs: 12, md: 7 }) }}>
          <Panel title="IHM Inventory Summary" subtitle="(points on board by class, plus replaced / removed)" color="#43a047">
            <BarChart
              skipAnimation
              height={260}
              xAxis={[{ scaleType: "band", data: inventoryBars.map((b) => b.label), colorMap: { type: "ordinal", colors: inventoryBars.map((b) => b.color) } }]}
              series={[{ data: inventoryBars.map((b) => b.value), label: "Inventory points" }]}
              slotProps={{ legend: { hidden: true } }}
            />
            <Typography variant="caption" color="text.secondary">
              i-1 Paints and Coating Systems · i-2 Equipment and Machinery · i-3 Structure and Hull
            </Typography>
          </Panel>
        </Box>

        {/* Inventory points */}
        <Box sx={{ gridColumn: span({ xs: 12, sm: 6, lg: 4 }) }}>
          <Panel title="Inventory Points" color="#00897b">
            <MetricRow label="IHM Audit Inventory Pts" value={inventory.survey ?? 0} loading={loading} />
            <MetricRow label="New Inventory Pts" value={inventory.newInstalled ?? 0} loading={loading} />
            <MetricRow label="Removed Inventory Pts" value={inventory.removed ?? 0} color="error.main" loading={loading} />
            <MetricRow label="Replaced Inventory Pts" value={inventory.replaced ?? 0} color="warning.main" loading={loading} />
            <MetricRow label="PCHM Items" value={inventory.pchm ?? 0} loading={loading} />
          </Panel>
        </Box>

        {/* PO review */}
        <Box sx={{ gridColumn: span({ xs: 12, sm: 6, lg: 4 }) }}>
          <Panel title="PO Review Summary" color="#fb8c00">
            <MetricRow label="PO Under IHM Category" value={pos.withHazmat ?? 0} loading={loading} />
            <MetricRow label="PO Received MD/SDOC" value={pos.docReceived ?? 0} color="success.main" loading={loading} />
            <MetricRow label="PO Pending MD/SDOC" value={pos.docPending ?? 0} color="warning.main" loading={loading} />
            <MetricRow label="PO Items" value={pos.items ?? 0} loading={loading} />
            <MetricRow label="Items that may contain Hazmat" value={pos.hazmatItems ?? 0} loading={loading} />
          </Panel>
        </Box>

        {/* IHM reports */}
        <Box sx={{ gridColumn: span({ xs: 12, sm: 6, lg: 4 }) }}>
          <Panel title="IHM Reports" color="#8e24aa">
            <MetricRow label="Reports Generated" value={reports.total ?? 0} loading={loading} />
            <MetricRow label="Approved" value={reports.approved ?? 0} color="success.main" loading={loading} />
            <MetricRow label="Pending Approval" value={reports.pending ?? 0} color="warning.main" loading={loading} />
            <MetricRow label="Last Generated" value={formatDate(reports.latest)} loading={loading} />
          </Panel>
        </Box>

        {/* Top hazmats */}
        <Box sx={{ gridColumn: span({ xs: 12, sm: 6, lg: 6 }) }}>
          <Panel title="Hazmats on Board" subtitle="(inventory points per hazmat)" color="#e53935">
            {!loading && topHazmats.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>No hazmats recorded yet.</Typography>
            ) : (
              topHazmats.map((h) => (
                <Box key={h.name} mb={1.5}>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" noWrap title={h.name}>{h.name}</Typography>
                    <Typography variant="body2" fontWeight={700}>{h.count}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(h.count / maxHazmat) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "#ffebee", "& .MuiLinearProgress-bar": { bgcolor: "#e53935", borderRadius: 4 } }}
                  />
                </Box>
              ))
            )}
          </Panel>
        </Box>

        {/* Data submit (sample) */}
        <Box sx={{ gridColumn: span({ xs: 12, sm: 6, lg: 6 }) }}>
          <Panel title="Data Submit Summary" color="#546e7a" badge="Sample data">
            {DATA_SUBMIT_SAMPLE.map((item) => (
              <MetricRow key={item.label} label={item.label} value={item.value} />
            ))}
          </Panel>
        </Box>

        {/* Vessels */}
        <Box sx={{ gridColumn: span({ xs: 12 }) }}>
          <Panel title="Vessels" subtitle="(click a vessel to open its dashboard)" color="#1976d2">
            <Box sx={{ width: "100%" }}>
              <DataGrid
                autoHeight
                rows={vesselList}
                columns={vesselColumns}
                loading={loading}
                onRowClick={(params) => openVessel(params.row)}
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true } }}
                sx={{ border: 0, "& .MuiDataGrid-row": { cursor: "pointer" } }}
              />
            </Box>
          </Panel>
        </Box>

        {/* Supplier follow-up (sample) */}
        <Box sx={{ gridColumn: span({ xs: 12 }) }}>
          <Panel title="Supplier Not Cooperating" color="#546e7a" badge="Sample data">
            <Box sx={{ width: "100%" }}>
              <DataGrid
                autoHeight
                rows={SUPPLIER_SAMPLE_ROWS}
                columns={supplierColumns}
                disableRowSelectionOnClick
                hideFooter
                sx={{ border: 0 }}
              />
            </Box>
          </Panel>
        </Box>
      </Box>
    </OPPageContainer>
  );
};

export default Dashboard;
