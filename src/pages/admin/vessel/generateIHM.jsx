import { useState, useEffect, useCallback, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GenerateIHMTopBar from "../../../components/generateIHMTopBar";
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import {
  getIHMReports,
  generateIHMReport,
  updateIHMReport,
  deleteIHMReport,
} from "../../../api/services/ihmReport";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return `${String(date.getDate()).padStart(2, "0")}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

const StatCard = ({ label, value, sub, color, loading }) => (
  <Card
    elevation={0}
    sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", borderTop: `3px solid ${color}`, boxSizing: "border-box" }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} noWrap>
      {loading ? <Skeleton width={48} /> : value}
    </Typography>
    {sub && (
      <Typography variant="caption" color="text.secondary" noWrap component="div">
        {loading ? <Skeleton width={80} /> : sub}
      </Typography>
    )}
  </Card>
);

const statusOf = (report) =>
  report.disabled
    ? { label: "Disabled", color: "default" }
    : report.approved
    ? { label: "Approved", color: "success" }
    : { label: "Pending approval", color: "warning" };

export default function GenerateIHM() {
  const theme = useTheme();
  const navigate = useNavigate();
  const vessel = useRecoilValue(commonVesselViewState);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [unapproveTarget, setUnapproveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadReports = useCallback(async () => {
    if (!vessel?.id) {
      setReports([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getIHMReports(vessel.id);
      setReports(res?.data?.reports ?? []);
    } catch (err) {
      toast.error(err?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [vessel?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const stats = useMemo(() => {
    const active = reports.filter((r) => !r.disabled);
    const latest = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return {
      total: reports.length,
      approved: active.filter((r) => r.approved).length,
      pending: active.filter((r) => !r.approved).length,
      latest,
    };
  }, [reports]);

  // Next whole version after the highest one generated so far.
  const nextVersion = useMemo(() => {
    const versions = reports.map((r) => parseFloat(r.version)).filter((v) => !Number.isNaN(v));
    return versions.length ? Math.floor(Math.max(...versions)) + 1 : 1;
  }, [reports]);

  const handleGenerate = async ({ version, periodToDate }) => {
    setGenerating(true);
    try {
      await generateIHMReport(vessel.id, { version, periodToDate });
      toast.success("IHM Report generated");
      await loadReports();
    } catch (err) {
      toast.error(err?.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    if (!report.fileUrl) return;
    window.open(`${import.meta.env.VITE_API_URL}/uploads/${report.fileUrl}`, "_blank");
  };

  const setApproved = async (report, approved) => {
    setBusyId(report.id);
    try {
      await updateIHMReport(report.id, { approved });
      toast.success(approved ? "Report approved" : "Report un-approved");
      await loadReports();
    } catch (err) {
      toast.error(err?.message || "Failed to update report");
    } finally {
      setBusyId(null);
    }
  };

  const handleApprovalToggle = (report) => {
    // Un-approving needs confirmation.
    if (report.approved) setUnapproveTarget(report);
    else setApproved(report, true);
  };

  const handleDelete = async () => {
    const report = deleteTarget;
    setBusyId(report.id);
    try {
      await deleteIHMReport(report.id);
      toast.success("Report deleted");
      await loadReports();
    } catch (err) {
      toast.error(err?.message || "Failed to delete report");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      field: "ihmReportNumber",
      headerName: "Report No",
      flex: 1.1,
      minWidth: 160,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {row.ihmReportNumber || "-"}
          </Typography>
          {row.version && <Chip size="small" label={`v${row.version}`} variant="outlined" />}
        </Box>
      ),
    },
    {
      field: "periodToDate",
      headerName: "Period To",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (value) => fmt(value),
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (value) => fmt(value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 150,
      sortable: false,
      renderCell: ({ row }) => {
        const status = statusOf(row);
        return <Chip size="small" label={status.label} color={status.color} variant={row.approved ? "filled" : "outlined"} />;
      },
    },
    {
      field: "approved",
      headerName: "Approved",
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title={row.approved ? "Un-approve" : "Approve"}>
          <Switch
            size="small"
            checked={!!row.approved}
            disabled={busyId === row.id}
            onChange={() => handleApprovalToggle(row)}
          />
        </Tooltip>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      align: "right",
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, height: "100%" }}>
          <Tooltip title={row.fileUrl ? "Download PDF" : "No file"}>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={!row.fileUrl}
                onClick={() => handleDownload(row)}
                sx={{ textTransform: "none" }}
              >
                PDF
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Delete report">
            <span>
              <IconButton size="small" color="error" disabled={busyId === row.id} onClick={() => setDeleteTarget(row)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (!vessel?.id) {
    return (
      <Box sx={{ p: 3, bgcolor: "#f4f6fa", minHeight: "100%", boxSizing: "border-box" }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
          <DirectionsBoatIcon sx={{ fontSize: 44, color: "text.disabled" }} />
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
            No vessel selected
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Open a vessel and click View to generate its IHM report.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/vessels/vessels")} sx={{ textTransform: "none" }}>
            Go to Vessels
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "#f4f6fa", minHeight: "100%", boxSizing: "border-box" }}>
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
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SummarizeOutlinedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700}>
            Generate IHM Report
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
            <Chip
              size="small"
              icon={<DirectionsBoatIcon sx={{ color: "#fff !important" }} />}
              label={vessel.name}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600 }}
            />
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {"Generate, approve and download this vessel's IHM reports."}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Counts */}
      <Box sx={{ display: "grid", gap: 2, mb: 3, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))" }}>
        <StatCard label="Reports Generated" value={stats.total} color="#1976d2" loading={loading && !reports.length} />
        <StatCard label="Approved" value={stats.approved} color="#43a047" loading={loading && !reports.length} />
        <StatCard label="Pending Approval" value={stats.pending} color="#f57c00" loading={loading && !reports.length} />
        <StatCard
          label="Latest Report"
          value={stats.latest?.ihmReportNumber || "-"}
          sub={stats.latest ? `Generated ${fmt(stats.latest.createdAt)}` : "None yet"}
          color="#8e24aa"
          loading={loading && !reports.length}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <GenerateIHMTopBar onGenerate={handleGenerate} generating={generating} defaultVersion={nextVersion} />
      </Box>

      {/* Reports */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({reports.length})
          </Typography>
        </Box>
        <Divider />
        <DataGrid
          autoHeight
          loading={loading}
          rows={reports}
          columns={columns}
          getRowId={(row) => row.id}
          rowHeight={60}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
          }}
          disableRowSelectionOnClick
          disableColumnMenu
          localeText={{ noRowsLabel: "No reports yet. Generate the first one above." }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </Paper>

      {/* Un-approve confirmation */}
      <Dialog open={!!unapproveTarget} onClose={() => setUnapproveTarget(null)}>
        <DialogTitle sx={{ color: theme.palette.error.main }}>Un-Approve Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will hide this report from Ship and Word Report will not be available as it was deleted on approval of
            this Report. Are you sure to Un-Approve this Report?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnapproveTarget(null)} variant="outlined">
            No
          </Button>
          <Button
            onClick={() => {
              const report = unapproveTarget;
              setUnapproveTarget(null);
              setApproved(report, false);
            }}
            variant="contained"
            color="error"
            autoFocus
          >
            Yes, un-approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => !busyId && setDeleteTarget(null)}>
        <DialogTitle>Delete report {deleteTarget?.ihmReportNumber}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The report and its PDF file are removed permanently. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={!!busyId}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={!!busyId}>
            {busyId ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={2500} />
    </Box>
  );
}
