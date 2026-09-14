import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";

const apiMessage = (error, fallback) => error?.response?.data?.message || fallback;

const StatCard = ({ label, value, color, loading }) => (
  <Card
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      borderTop: `3px solid ${color}`,
      boxSizing: "border-box",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700}>
      {loading ? <Skeleton width={36} /> : value}
    </Typography>
  </Card>
);

/**
 * One page for each "Edit Items" master list (locations, sub-locations,
 * equipment, document types, compartments, objects). They share the same API
 * shape: GET/POST `endpoint`, PUT `endpoint/:id` with { name, isDisabled }.
 */
export default function MasterDataManager({
  title,
  singular,
  endpoint,
  description,
  icon: Icon,
  color = "#1976d2",
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  // null = drawer closed; {} = adding; a row = editing it.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", isDisabled: false });
  const [touched, setTouched] = useState(false);
  const noun = singular.toLowerCase();

  const list = useQuery({
    queryKey: ["masterData", endpoint],
    queryFn: async () => {
      // The API pages lists at 10 by default; ask for everything.
      const response = await axiosInstance.get(endpoint, { params: { limit: 1000 } });
      return response.data.data ?? [];
    },
  });

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const activeCount = rows.filter((r) => !r.isDisabled).length;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows
      .filter((r) => (status === "all" ? true : status === "active" ? !r.isDisabled : r.isDisabled))
      .filter((r) => !query || String(r.name).toLowerCase().includes(query))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [rows, search, status]);

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: ["masterData", endpoint] });
    // Dropdowns across the app read these lists from the generic data.
    queryClient.invalidateQueries({ queryKey: ["genericData"] });
  };

  const closeDrawer = () => {
    setEditing(null);
    setTouched(false);
  };

  const save = useMutation({
    mutationFn: ({ id, ...body }) =>
      id ? axiosInstance.put(`${endpoint}/${id}`, body) : axiosInstance.post(endpoint, body),
    onSuccess: (_, variables) => {
      toast.success(`${singular} ${variables.id ? "updated" : "added"}`);
      refreshLists();
      closeDrawer();
    },
    onError: (error) => toast.error(apiMessage(error, `Could not save the ${noun}`)),
  });

  const toggle = useMutation({
    mutationFn: (row) =>
      axiosInstance.put(`${endpoint}/${row.id}`, { name: row.name, isDisabled: !row.isDisabled }),
    onSuccess: (_, row) => {
      toast.success(`${row.name} ${row.isDisabled ? "enabled" : "disabled"}`);
      refreshLists();
    },
    onError: (error) => toast.error(apiMessage(error, `Could not update the ${noun}`)),
  });

  const openDrawer = (row) => {
    setEditing(row ?? {});
    setForm(row ? { name: row.name ?? "", isDisabled: !!row.isDisabled } : { name: "", isDisabled: false });
    setTouched(false);
  };

  const trimmedName = form.name.trim();
  const duplicate = rows.some(
    (r) => r.id !== editing?.id && String(r.name).trim().toLowerCase() === trimmedName.toLowerCase()
  );
  const nameError = !trimmedName
    ? `${singular} name is required`
    : duplicate
    ? `${/^[aeiou]/.test(noun) ? "An" : "A"} ${noun} with this name already exists`
    : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;
    save.mutate({ id: editing?.id, name: trimmedName, isDisabled: form.isDisabled });
  };

  const columns = [
    {
      field: "name",
      headerName: `${singular} Name`,
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: 14, bgcolor: `${color}1f`, color }}>
            {String(row.name ?? "?").charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight={600} noWrap title={row.name}>
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: "isDisabled",
      headerName: "Status",
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Disabled" : "Active"}
          color={value ? "default" : "success"}
          variant={value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "enabled",
      headerName: "Enabled",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Tooltip title={row.isDisabled ? "Enable" : "Disable"}>
          <Switch
            size="small"
            checked={!row.isDisabled}
            disabled={toggle.isPending}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggle.mutate(row)}
          />
        </Tooltip>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 70,
      sortable: false,
      filterable: false,
      align: "right",
      renderCell: ({ row }) => (
        <Tooltip title={`Edit ${noun}`}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openDrawer(row);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
          background: `linear-gradient(135deg, #0d47a1 0%, ${color} 100%)`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
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
            {Icon && <Icon sx={{ fontSize: 30 }} />}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.8, lineHeight: 1.4 }}>
              Edit Items
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDrawer(null)}
          sx={{ bgcolor: "#fff", color: "#0d47a1", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#e3f2fd" } }}
        >
          Add {singular}
        </Button>
      </Paper>

      {/* Counts */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 3,
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
        }}
      >
        <StatCard label={`Total ${title}`} value={rows.length} color={color} loading={list.isPending} />
        <StatCard label="Active" value={activeCount} color="#43a047" loading={list.isPending} />
        <StatCard label="Disabled" value={rows.length - activeCount} color="#90a4ae" loading={list.isPending} />
      </Box>

      {/* List */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: "1 1 240px", maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            value={status}
            onChange={(_, value) => value && setStatus(value)}
          >
            <ToggleButton value="all" sx={{ textTransform: "none", px: 2 }}>All</ToggleButton>
            <ToggleButton value="active" sx={{ textTransform: "none", px: 2 }}>Active</ToggleButton>
            <ToggleButton value="disabled" sx={{ textTransform: "none", px: 2 }}>Disabled</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
            {filteredRows.length} of {rows.length}
          </Typography>
        </Box>
        <Divider />
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={list.isPending}
          disableRowSelectionOnClick
          disableColumnMenu
          onRowClick={({ row }) => openDrawer(row)}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          localeText={{ noRowsLabel: list.isError ? `Could not load ${title.toLowerCase()}` : `No ${title.toLowerCase()} found` }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            "& .MuiDataGrid-row": { cursor: "pointer" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </Paper>

      {/* Add / edit */}
      <Drawer anchor="right" open={editing !== null} onClose={closeDrawer}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ width: { xs: "100vw", sm: 420 }, height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: `${color}0f` }}>
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
              {Icon && <Icon />}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {editing?.id ? `Edit ${singular}` : `Add ${singular}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editing?.id ? `Rename or change the status of this ${noun}.` : `Add a new ${noun} to the list.`}
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, flexGrow: 1 }}>
            <TextField
              autoFocus
              required
              fullWidth
              label={`${singular} Name`}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={() => setTouched(true)}
              error={touched && !!nameError}
              helperText={touched && nameError ? nameError : " "}
            />
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>{form.isDisabled ? "Disabled" : "Active"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Disabled {title.toLowerCase()} are hidden from dropdowns but stay on existing records.
                </Typography>
              </Box>
              <Switch
                checked={!form.isDisabled}
                onChange={(e) => setForm((prev) => ({ ...prev, isDisabled: !e.target.checked }))}
                inputProps={{ "aria-label": "Active" }}
              />
            </Paper>
          </Box>

          <Divider />
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button onClick={closeDrawer} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={save.isPending} sx={{ textTransform: "none", px: 3 }}>
              {save.isPending ? "Saving..." : editing?.id ? "Save Changes" : `Add ${singular}`}
            </Button>
          </Box>
        </Box>
      </Drawer>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
