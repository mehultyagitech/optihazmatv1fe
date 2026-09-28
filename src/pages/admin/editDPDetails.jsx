import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import BadgeIcon from "@mui/icons-material/Badge";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api/axiosInstance";

const COLOR = "#00897b";
const apiMessage = (error, fallback) => error?.response?.data?.message || fallback;

const uploadsUrl = (fileName) => `${import.meta.env.VITE_API_URL}/uploads/${fileName}`;

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

// Label on the left, field on the right, as on the DP form.
const FormRow = ({ label, required, children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" }, gap: { xs: 0.5, sm: 2 }, alignItems: "center" }}>
    <Typography variant="body2" sx={{ textAlign: { sm: "right" }, color: "text.secondary" }}>
      {label}
      {required && <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>}
    </Typography>
    {children}
  </Box>
);

const EMPTY = { name: "", position: "", initials: "" };

/**
 * Designated Persons: who can be made responsible for keeping an IHM up to
 * date. Who holds the role on a vessel, and for how long, is set on that
 * vessel's DP Details tab.
 */
export default function EditDPDetails() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  // null = form closed; {} = adding; a row = editing it.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  // The picked file, or "remove" to clear the stored one.
  const [signature, setSignature] = useState(null);
  const fileInput = useRef(null);

  const list = useQuery({
    queryKey: ["designatedPersons"],
    queryFn: async () => (await axiosInstance.get("/designated-persons", { params: { limit: 1000 } })).data.data ?? [],
  });

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const withSignature = rows.filter((row) => !!row.signatureUrl).length;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.name, row.position, row.initials].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [rows, search]);

  const closeForm = () => {
    setEditing(null);
    setTouched(false);
    setSignature(null);
  };

  const openForm = (row) => {
    setEditing(row ?? {});
    setForm(
      row
        ? { name: row.name ?? "", position: row.position ?? "", initials: row.initials ?? "" }
        : EMPTY
    );
    setTouched(false);
    setSignature(null);
  };

  const save = useMutation({
    mutationFn: ({ id, ...values }) => {
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => body.append(key, value ?? ""));
      if (signature instanceof File) body.append("signature", signature);
      if (signature === "remove") body.append("removeSignature", "true");
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      return id
        ? axiosInstance.put(`/designated-persons/${id}`, body, config)
        : axiosInstance.post("/designated-persons", body, config);
    },
    onSuccess: (_, variables) => {
      toast.success(`DP ${variables.id ? "updated" : "added"}`);
      queryClient.invalidateQueries({ queryKey: ["designatedPersons"] });
      closeForm();
    },
    onError: (error) => toast.error(apiMessage(error, "Could not save the DP")),
  });

  const remove = useMutation({
    mutationFn: (row) => axiosInstance.delete(`/designated-persons/${row.id}`),
    onSuccess: (_, row) => {
      toast.success(`${row.name} removed`);
      queryClient.invalidateQueries({ queryKey: ["designatedPersons"] });
    },
    onError: (error) => toast.error(apiMessage(error, "Could not remove the DP")),
  });

  const errors = {
    name: form.name.trim() ? "" : "DP Name is required",
    position: form.position.trim() ? "" : "Position is required",
    initials: form.initials.trim() ? "" : "Initials are required",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (field) => (touched ? errors[field] : "");

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    save.mutate({
      id: editing?.id,
      name: form.name.trim(),
      position: form.position.trim(),
      initials: form.initials.trim(),
    });
  };

  const handleDelete = (row) => {
    if (window.confirm(`Remove ${row.name} from the DP list?`)) remove.mutate(row);
  };

  // The stored signature, unless it is being replaced or cleared.
  const signaturePreview =
    signature instanceof File
      ? URL.createObjectURL(signature)
      : signature === "remove"
        ? null
        : editing?.signatureUrl
          ? uploadsUrl(editing.signatureUrl)
          : null;

  const columns = [
    { field: "name", headerName: "DP Name", flex: 1, minWidth: 180 },
    { field: "position", headerName: "Position", flex: 1, minWidth: 160 },
    { field: "initials", headerName: "Initials", width: 100 },
    {
      field: "signatureUrl",
      headerName: "Signature",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: ({ value, row }) =>
        value ? (
          <Box
            component="img"
            src={uploadsUrl(value)}
            alt={`${row.name} signature`}
            sx={{ height: 38, maxWidth: 130, objectFit: "contain", py: 0.5 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      filterable: false,
      align: "right",
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Edit DP">
            <IconButton size="small" onClick={() => openForm(row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove DP">
            <IconButton size="small" color="error" disabled={remove.isPending} onClick={() => handleDelete(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
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
          background: `linear-gradient(135deg, #0d47a1 0%, ${COLOR} 100%)`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BadgeIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.8, lineHeight: 1.4 }}>
              Edit Items
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              DP Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              The people who can be made a vessel's Designated Person. Their period is set on the vessel.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openForm(null)}
          sx={{ bgcolor: "#fff", color: "#0d47a1", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#e0f2f1" } }}
        >
          Add DP
        </Button>
      </Paper>

      {/* Counts */}
      <Box sx={{ display: "grid", gap: 2, mb: 3, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))" }}>
        <StatCard label="Total DPs" value={rows.length} color={COLOR} loading={list.isPending} />
        <StatCard label="With a signature" value={withSignature} color="#43a047" loading={list.isPending} />
        <StatCard label="Without" value={rows.length - withSignature} color="#90a4ae" loading={list.isPending} />
      </Box>

      {/* List */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ p: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search DPs..."
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
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
            {filteredRows.length} of {rows.length}
          </Typography>
        </Box>
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          loading={list.isPending}
          rowHeight={56}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" } }}
        />
      </Paper>

      {/* DP Form */}
      <Dialog open={!!editing} onClose={closeForm} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, bgcolor: "#e3f2fd", color: "#0d47a1", fontWeight: 700 }}>
            DP Form
            <IconButton onClick={closeForm} aria-label="close" size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, mt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: COLOR, fontWeight: 700, mb: 2 }}>
                DP Details
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormRow label="DP Name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    error={!!showError("name")}
                    helperText={showError("name")}
                  />
                </FormRow>
                <FormRow label="Position" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={form.position}
                    onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                    error={!!showError("position")}
                    helperText={showError("position")}
                  />
                </FormRow>
                <FormRow label="Initials" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={form.initials}
                    onChange={(e) => setForm((prev) => ({ ...prev, initials: e.target.value }))}
                    error={!!showError("initials")}
                    helperText={showError("initials")}
                  />
                </FormRow>
                <FormRow label="Signature">
                  <Box>
                    <Box
                      sx={{
                        height: 110,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      {signaturePreview ? (
                        <Box component="img" src={signaturePreview} alt="Signature" sx={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No signature
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button size="small" startIcon={<UploadFileIcon />} onClick={() => fileInput.current?.click()} sx={{ textTransform: "none" }}>
                        {signaturePreview ? "Replace" : "Upload"}
                      </Button>
                      {signaturePreview && (
                        <Button size="small" color="error" onClick={() => setSignature("remove")} sx={{ textTransform: "none" }}>
                          Remove
                        </Button>
                      )}
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSignature(file);
                          e.target.value = "";
                        }}
                      />
                    </Box>
                  </Box>
                </FormRow>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button type="submit" variant="contained" disabled={save.isPending} sx={{ textTransform: "none", minWidth: 120 }}>
              {save.isPending ? "Saving..." : "Submit"}
            </Button>
            <Button variant="outlined" onClick={closeForm} sx={{ textTransform: "none", minWidth: 120 }}>
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
