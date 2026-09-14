import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const filter = createFilterOptions();

/**
 * Searchable master-data field ("pick or add new").
 *
 * Type to filter the list. "+ Add ..." opens a card that creates the value in
 * the master list (POST `endpoint` with { name }) and selects it. `value` is
 * the selected id; `onChange` receives a change-like event
 * ({ target: { name, value } }) so a form can keep its normal handler.
 */
export default function MasterDataAutocomplete({
  label,
  name,
  value,
  options = [],
  endpoint,
  onChange,
  error,
  helperText,
  size,
  sx,
}) {
  const queryClient = useQueryClient();
  // Values added here, shown straight away while the master list refreshes.
  const [created, setCreated] = useState([]);
  // Name being added; null while the card is closed.
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const allOptions = useMemo(() => {
    const byId = new Map();
    [...options, ...created].forEach((option) => option?.id && byId.set(option.id, option));
    return [...byId.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [options, created]);

  const selected = allOptions.find((option) => option.id === value) ?? null;

  const emit = (id) =>
    onChange({ target: { name, value: id ?? "", type: "text" } });

  const findByName = (text) =>
    allOptions.find(
      (option) => String(option.name).trim().toLowerCase() === text.toLowerCase()
    );

  const save = async () => {
    const newName = (draft ?? "").trim();
    if (!newName) {
      toast.error(`Please enter a ${label} name.`);
      return;
    }
    // Already in the list (any letter case): just select it.
    const existing = findByName(newName);
    if (existing) {
      emit(existing.id);
      setDraft(null);
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.post(endpoint, {
        name: newName,
        isDisabled: false,
      });
      const item = response.data?.data;
      setCreated((prev) => [...prev, item]);
      emit(item.id);
      setDraft(null);
      toast.success(`${label} "${item.name}" added.`);
      // Refresh the shared lists so every screen sees the new value.
      queryClient.invalidateQueries({ queryKey: ["genericData"] });
    } catch (e) {
      toast.error(e?.response?.data?.message || `Could not add the ${label}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Autocomplete
        fullWidth
        size={size}
        sx={sx}
        options={allOptions}
        value={selected}
        onChange={(_, option) => {
          if (option?.isNew) {
            setDraft(option.inputValue);
            return;
          }
          emit(option?.id);
        }}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const typed = params.inputValue.trim();
          if (!typed || !findByName(typed)) {
            filtered.push({
              isNew: true,
              inputValue: typed,
              name: typed ? `+ Add "${typed}"` : `+ Add new ${label}`,
            });
          }
          return filtered;
        }}
        getOptionLabel={(option) =>
          option?.isNew ? option.inputValue : option?.name ?? ""
        }
        isOptionEqualToValue={(option, current) => option.id === current.id}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <li
              key={option.isNew ? `new-${option.inputValue}` : option.id}
              {...rest}
              style={option.isNew ? { fontWeight: 600, color: "#1976d2" } : undefined}
            >
              {option.name}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label={label} error={error} helperText={helperText} />
        )}
      />

      <Dialog
        open={draft !== null}
        onClose={() => !saving && setDraft(null)}
        maxWidth="xs"
        fullWidth
      >
        <Card elevation={0}>
          <CardHeader
            title={`Add ${label}`}
            subheader={`Adds it to the ${label} list and selects it.`}
          />
          <CardContent>
            <TextField
              autoFocus
              fullWidth
              label={`${label} name`}
              value={draft ?? ""}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
            />
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
            <Button onClick={() => setDraft(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={save} disabled={saving}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
}
