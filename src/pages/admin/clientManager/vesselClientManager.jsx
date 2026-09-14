import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InfoCard from "../../../components/InfoCard";
import AddEditClientManagerDrawer from "./addEditClientManagerDrawer";
import {
  getAllClientManagers,
  deleteClientManager,
} from "../../../api/services/clientManager";

const StatCard = ({ label, value, color, loading }) => (
  <Card
    elevation={0}
    sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", borderTop: `3px solid ${color}`, boxSizing: "border-box" }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700}>
      {loading ? <Skeleton width={36} /> : value}
    </Typography>
  </Card>
);

const VesselClientManager = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState("clients");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState({ open: false, company: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  const list = useQuery({
    queryKey: ["clientManagers"],
    queryFn: getAllClientManagers,
    select: (res) => res?.data ?? [],
  });

  const companies = useMemo(() => list.data ?? [], [list.data]);
  const clients = companies.filter((c) => c.isClient);
  const managers = companies.filter((c) => !c.isClient);
  const showingClients = view === "clients";
  const vesselTotal = clients.reduce((sum, c) => sum + (c.vesselCount ?? 0), 0);
  const unused = companies.filter((c) => !c.vesselCount).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companies
      .filter((c) => (showingClients ? c.isClient : !c.isClient))
      .filter(
        (c) =>
          !query ||
          [c.companyName, c.verifaviaId, c.address, c.contactDetails]
            .some((value) => String(value ?? "").toLowerCase().includes(query))
      )
      .sort((a, b) => String(a.companyName).localeCompare(String(b.companyName)));
  }, [companies, search, showingClients]);

  const remove = useMutation({
    mutationFn: (company) => deleteClientManager(company.id),
    onSuccess: (_, company) => {
      toast.success(`${company.companyName} deleted`);
      queryClient.invalidateQueries({ queryKey: ["genericData"] });
      queryClient.invalidateQueries({ queryKey: ["clientManagers"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Could not delete this company"),
    onSettled: () => setPendingDelete(null),
  });

  const kindLabel = showingClients ? "client" : "fleet manager";

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
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ApartmentIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Clients & Fleet Managers
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              The companies your vessels are registered to and managed by.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
          onClick={() => setDrawer({ open: true, company: null })}
          sx={{ bgcolor: "#fff", color: "#0d47a1", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#e3f2fd" } }}
        >
          Add {showingClients ? "Client" : "Fleet Manager"}
        </Button>
      </Paper>

      {/* Counts */}
      <Box sx={{ display: "grid", gap: 2, mb: 3, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))" }}>
        <StatCard label="Clients" value={clients.length} color="#1976d2" loading={list.isPending} />
        <StatCard label="Fleet Managers" value={managers.length} color="#00897b" loading={list.isPending} />
        <StatCard label="Vessels Linked" value={vesselTotal} color="#f57c00" loading={list.isPending} />
        <StatCard label="Without Vessels" value={unused} color="#90a4ae" loading={list.isPending} />
      </Box>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ToggleButtonGroup size="small" exclusive color="primary" value={view} onChange={(_, v) => v && setView(v)}>
          <ToggleButton value="clients" sx={{ textTransform: "none", px: 2 }}>
            Clients ({clients.length})
          </ToggleButton>
          <ToggleButton value="managers" sx={{ textTransform: "none", px: 2 }}>
            Fleet Managers ({managers.length})
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder="Search name, ID, address or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: "1 1 260px", maxWidth: 420 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
          {filtered.length} of {showingClients ? clients.length : managers.length}
        </Typography>
      </Paper>

      {/* Cards */}
      {list.isPending ? (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={230} />
          ))}
        </Box>
      ) : list.isError ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
          <Typography color="error">Could not load clients and fleet managers.</Typography>
        </Paper>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
          <Typography fontWeight={600}>
            {search ? `No ${kindLabel}s match "${search}"` : `No ${kindLabel}s yet`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {search ? "Try a different name or ID." : `Add a ${kindLabel} to link it to vessels.`}
          </Typography>
          {!search && (
            <Button variant="outlined" startIcon={<AddBusinessIcon />} onClick={() => setDrawer({ open: true, company: null })} sx={{ textTransform: "none" }}>
              Add {showingClients ? "Client" : "Fleet Manager"}
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
          {filtered.map((company) => {
            const vessels = company.vesselCount ?? 0;
            return (
              <InfoCard
                key={company.id}
                avatarVariant="rounded"
                title={company.companyName}
                subtitle={company.isClient ? "Client (vessel owner)" : "Fleet Manager"}
                fields={[
                  { label: "OptiHazmat ID", value: company.verifaviaId },
                  { label: "Vessels", value: vessels, color: vessels ? "primary.main" : undefined },
                  { label: "Address", value: company.address },
                  { label: "Contact", value: company.contactDetails },
                ]}
                actions={
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      sx={{ textTransform: "none" }}
                      onClick={() => setDrawer({ open: true, company })}
                    >
                      Edit
                    </Button>
                    <Tooltip
                      title={vessels ? `Linked to ${vessels} vessel${vessels === 1 ? "" : "s"}. Reassign ${vessels === 1 ? "it" : "them"} before deleting.` : ""}
                    >
                      <span>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          sx={{ textTransform: "none" }}
                          disabled={vessels > 0}
                          onClick={() => setPendingDelete(company)}
                        >
                          Delete
                        </Button>
                      </span>
                    </Tooltip>
                  </>
                }
              />
            );
          })}
        </Box>
      )}

      <AddEditClientManagerDrawer
        open={drawer.open}
        company={drawer.company}
        defaultIsClient={showingClients}
        onClose={() => setDrawer({ open: false, company: null })}
      />

      <Dialog open={!!pendingDelete} onClose={() => !remove.isPending && setPendingDelete(null)}>
        <DialogTitle>Delete {pendingDelete?.companyName}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes the {pendingDelete?.isClient ? "client" : "fleet manager"} permanently. It has no vessels linked.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} disabled={remove.isPending}>
            Cancel
          </Button>
          <Button color="error" variant="contained" disabled={remove.isPending} onClick={() => remove.mutate(pendingDelete)}>
            {remove.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default VesselClientManager;
