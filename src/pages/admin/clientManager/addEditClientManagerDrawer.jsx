import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  createClientManagers,
  updateClientManager,
} from "../../../api/services/clientManager";

const EMPTY = {
  companyName: "",
  verifaviaId: "",
  address: "",
  contactDetails: "",
  isClient: true,
};

const REQUIRED = {
  companyName: "Company Name is required",
  verifaviaId: "OptiHazmat ID is required",
  address: "Address is required",
  contactDetails: "Contact Details are required",
};

/**
 * Add or edit a client (vessel owner) or fleet manager. `company` is the one
 * being edited, or null to add; `defaultIsClient` picks the type for a new one.
 */
const AddEditClientManagerDrawer = ({ open, onClose, company = null, defaultIsClient = true }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!company?.id;
  // A company that already has vessels keeps its type; changing it would
  // leave those vessels pointing at the wrong kind of company.
  const typeLocked = isEdit && (company?.vesselCount ?? 0) > 0;

  // Start from the company being edited, or a blank form, on every open.
  useEffect(() => {
    if (!open) return;
    setForm(
      company
        ? {
            companyName: company.companyName ?? "",
            verifaviaId: company.verifaviaId ?? "",
            address: company.address ?? "",
            contactDetails: company.contactDetails ?? "",
            isClient: !!company.isClient,
          }
        : { ...EMPTY, isClient: defaultIsClient }
    );
    setTouched(false);
  }, [open, company, defaultIsClient]);

  const errors = Object.fromEntries(
    Object.entries(REQUIRED).map(([key, message]) => [key, String(form[key] ?? "").trim() ? "" : message])
  );
  const hasErrors = Object.values(errors).some(Boolean);
  const kind = form.isClient ? "Client" : "Fleet Manager";

  const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setSaving(true);
    const payload = {
      companyName: form.companyName.trim(),
      verifaviaId: form.verifaviaId.trim(),
      address: form.address.trim(),
      contactDetails: form.contactDetails.trim(),
      isClient: form.isClient,
    };
    try {
      if (isEdit) {
        await updateClientManager(company.id, { id: company.id, ...payload });
        toast.success(`${kind} updated`);
      } else {
        await createClientManagers(payload);
        toast.success(`${kind} added`);
      }
      // Vessel screens read clients/managers from the generic data.
      queryClient.invalidateQueries({ queryKey: ["genericData"] });
      queryClient.invalidateQueries({ queryKey: ["clientManagers"] });
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => (touched && errors[name] ? errors[name] : " ");

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ width: { xs: "100vw", sm: 480 }, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "#1976d20f" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#1976d21f",
              color: "#1565c0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ApartmentIcon />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? `Edit ${kind}` : `Add ${kind}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {isEdit ? company.companyName : "Link it to vessels as client or manager."}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, overflowY: "auto" }}>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Company type
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              color="primary"
              value={form.isClient ? "client" : "manager"}
              disabled={typeLocked}
              onChange={(_, value) => value && setForm((prev) => ({ ...prev, isClient: value === "client" }))}
            >
              <ToggleButton value="client" sx={{ textTransform: "none", gap: 1, py: 1.25 }}>
                <DirectionsBoatIcon fontSize="small" /> Client (vessel owner)
              </ToggleButton>
              <ToggleButton value="manager" sx={{ textTransform: "none", gap: 1, py: 1.25 }}>
                <EngineeringIcon fontSize="small" /> Fleet Manager
              </ToggleButton>
            </ToggleButtonGroup>
            {typeLocked && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                {`The type can't change while ${company.vesselCount} vessel${company.vesselCount === 1 ? " is" : "s are"} linked.`}
              </Typography>
            )}
          </Box>

          <TextField
            autoFocus
            required
            fullWidth
            label="Company Name"
            value={form.companyName}
            onChange={setField("companyName")}
            error={touched && !!errors.companyName}
            helperText={fieldError("companyName")}
          />
          <TextField
            required
            fullWidth
            label="OptiHazmat ID (VID)"
            value={form.verifaviaId}
            onChange={setField("verifaviaId")}
            error={touched && !!errors.verifaviaId}
            helperText={fieldError("verifaviaId")}
          />
          <TextField
            required
            fullWidth
            multiline
            minRows={2}
            label="Address"
            value={form.address}
            onChange={setField("address")}
            error={touched && !!errors.address}
            helperText={fieldError("address")}
          />
          <TextField
            required
            fullWidth
            multiline
            minRows={2}
            label="Contact Details"
            placeholder="Contact person, email, phone"
            value={form.contactDetails}
            onChange={setField("contactDetails")}
            error={touched && !!errors.contactDetails}
            helperText={fieldError("contactDetails")}
          />
        </Box>

        <Divider />
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: "none", px: 3 }}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : `Add ${kind}`}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddEditClientManagerDrawer;
