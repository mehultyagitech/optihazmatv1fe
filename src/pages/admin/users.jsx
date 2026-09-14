import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupIcon from "@mui/icons-material/Group";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllUsers, createUser, updateUser } from "../../api/services/userService";

const DEFAULT_PASSWORD = "admin123";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  id: null,
  name: "",
  email: "",
  roles: "USER",
  disabled: false,
};

const ROLE_OPTIONS = [
  { value: "USER", label: "User", hint: "Works on vessels, inventory points and reports." },
  { value: "ADMIN", label: "Admin", hint: "Everything a user can do, plus managing users." },
];

const initials = (name, email) =>
  (name || email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

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

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const isEdit = !!form.id;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setRows(res?.data?.users ?? []);
    } catch (error) {
      toast.error(error?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      admins: rows.filter((u) => u.roles === "ADMIN").length,
      active: rows.filter((u) => !u.disabled).length,
      disabled: rows.filter((u) => u.disabled).length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter(
      (u) =>
        (roleFilter === "all" || u.roles === roleFilter) &&
        (statusFilter === "all" || (statusFilter === "active" ? !u.disabled : u.disabled)) &&
        (!query || `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(query))
    );
  }, [rows, search, roleFilter, statusFilter]);

  const openAdd = () => {
    setForm(emptyForm);
    setTouched(false);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      roles: row.roles || "USER",
      disabled: !!row.disabled,
    });
    setTouched(false);
    setDrawerOpen(true);
  };

  const errors = {
    name: form.name.trim() ? "" : "User name is required",
    email: !form.email.trim()
      ? "Login Id (email) is required"
      : EMAIL_PATTERN.test(form.email.trim())
      ? ""
      : "Enter a valid email address",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (errors.name || errors.email) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(form.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          roles: form.roles,
          disabled: form.disabled,
        });
        toast.success("User updated");
      } else {
        await createUser({ name: form.name.trim(), email: form.email.trim(), roles: form.roles });
        toast.success(`User created. Initial password: ${DEFAULT_PASSWORD}`, { autoClose: 5000 });
      }
      setDrawerOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "User",
      flex: 1.4,
      minWidth: 240,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%", minWidth: 0 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 14,
              fontWeight: 700,
              bgcolor: row.roles === "ADMIN" ? "#e3f2fd" : "#eceff1",
              color: row.roles === "ADMIN" ? "#1565c0" : "#546e7a",
            }}
          >
            {initials(row.name, row.email)}
          </Avatar>
          <Box sx={{ minWidth: 0, lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.name || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "roles",
      headerName: "Role",
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value === "ADMIN" ? "Admin" : "User"}
          color={value === "ADMIN" ? "primary" : "default"}
          variant={value === "ADMIN" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "disabled",
      headerName: "Status",
      width: 130,
      renderCell: ({ value }) => (
        <Chip size="small" label={value ? "Disabled" : "Active"} color={value ? "error" : "success"} variant="outlined" />
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
        <Tooltip title="Edit user">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
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
            <GroupIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Users
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Manage who can sign in to OptiHazmat and what they can do.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={openAdd}
          sx={{ bgcolor: "#fff", color: "#0d47a1", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#e3f2fd" } }}
        >
          Add User
        </Button>
      </Paper>

      {/* Counts */}
      <Box sx={{ display: "grid", gap: 2, mb: 3, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))" }}>
        <StatCard label="Total Users" value={counts.total} color="#1976d2" loading={loading} />
        <StatCard label="Admins" value={counts.admins} color="#8e24aa" loading={loading} />
        <StatCard label="Active" value={counts.active} color="#43a047" loading={loading} />
        <StatCard label="Disabled" value={counts.disabled} color="#e53935" loading={loading} />
      </Box>

      {/* List */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ p: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search name or email..."
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
          <ToggleButtonGroup size="small" exclusive value={roleFilter} onChange={(_, v) => v && setRoleFilter(v)}>
            <ToggleButton value="all" sx={{ textTransform: "none", px: 2 }}>All roles</ToggleButton>
            <ToggleButton value="ADMIN" sx={{ textTransform: "none", px: 2 }}>Admins</ToggleButton>
            <ToggleButton value="USER" sx={{ textTransform: "none", px: 2 }}>Users</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup size="small" exclusive value={statusFilter} onChange={(_, v) => v && setStatusFilter(v)}>
            <ToggleButton value="all" sx={{ textTransform: "none", px: 2 }}>Any status</ToggleButton>
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
          loading={loading}
          rowHeight={60}
          disableRowSelectionOnClick
          disableColumnMenu
          onRowClick={({ row }) => openEdit(row)}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          localeText={{ noRowsLabel: "No users found" }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            "& .MuiDataGrid-row": { cursor: "pointer" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </Paper>

      {/* Add / edit */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ width: { xs: "100vw", sm: 440 }, height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "#1976d20f" }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700 }}>
              {isEdit ? initials(form.name, form.email) : <PersonAddAlt1Icon />}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700}>
                {isEdit ? "Edit User" : "Add User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {isEdit ? form.email : "Invite a colleague to OptiHazmat."}
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, flexGrow: 1, overflowY: "auto" }}>
            <TextField
              autoFocus
              required
              fullWidth
              label="User Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              error={touched && !!errors.name}
              helperText={touched && errors.name ? errors.name : " "}
            />
            <TextField
              required
              fullWidth
              type="email"
              label="Login Id (email)"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              error={touched && !!errors.email}
              helperText={touched && errors.email ? errors.email : " "}
            />
            <TextField
              select
              fullWidth
              label="User Role"
              value={form.roles}
              onChange={(e) => setForm((prev) => ({ ...prev, roles: e.target.value }))}
              helperText={ROLE_OPTIONS.find((r) => r.value === form.roles)?.hint}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            {isEdit ? (
              <Paper
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{form.disabled ? "Disabled" : "Active"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disabled users cannot sign in.
                  </Typography>
                </Box>
                <Switch
                  checked={!form.disabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, disabled: !e.target.checked }))}
                  inputProps={{ "aria-label": "Active" }}
                />
              </Paper>
            ) : (
              <Alert severity="info" variant="outlined">
                The initial password is <strong>{DEFAULT_PASSWORD}</strong>. The user can change it after signing in.
              </Alert>
            )}
          </Box>

          <Divider />
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button onClick={() => setDrawerOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: "none", px: 3 }}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </Button>
          </Box>
        </Box>
      </Drawer>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
