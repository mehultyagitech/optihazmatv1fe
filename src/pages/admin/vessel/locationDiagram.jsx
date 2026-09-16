import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import CropIcon from "@mui/icons-material/Crop";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ListPageHeader, { headerButtonSx } from "../../../components/ListPageHeader";
import OPPageContainer from "../../../components/OPPageContainer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import {
  LocationSelector,
  SubLocationSelector,
} from "../../../utils/States/Generic";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Inventory point counts shown on each card (computed by the API).
const COUNT_LABELS = [
  ["survey", "Survey"],
  ["maintenance", "Maint"],
  ["removedReplaced", "Rem/Rep"],
  ["active", "Active"],
];

const COUNT_COLORS = {
  survey: { color: "#1565c0", bg: "#e3f2fd" },
  maintenance: { color: "#00695c", bg: "#e0f2f1" },
  removedReplaced: { color: "#c62828", bg: "#ffebee" },
  active: { color: "#2e7d32", bg: "#e8f5e9" },
};

const DiagramCard = ({ diagram, avatarSrc, selected, onToggle, onDelete }) => {
  const navigate = useNavigate();
  const counts = diagram.pinCounts ?? {};
  const openPoints = () => navigate(`/vessels/inventory-points/${diagram.id}`);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected ? "0 0 0 1px #1976d2" : "0 1px 3px rgba(15, 23, 42, 0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(13, 71, 161, 0.16)" },
      }}
    >
      {/* Diagram image */}
      <Box sx={{ position: "relative" }}>
        <CardActionArea onClick={openPoints} aria-label={`Open ${diagram.locationName} / ${diagram.subLocationName}`}>
          <Box
            sx={{
              height: 150,
              bgcolor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {diagram.imageUrl ? (
              <Box
                component="img"
                src={avatarSrc}
                alt={`${diagram.locationName} / ${diagram.subLocationName}`}
                sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1, boxSizing: "border-box" }}
              />
            ) : (
              <PlaceOutlinedIcon sx={{ fontSize: 48, color: "#b0bec5" }} />
            )}
          </Box>
        </CardActionArea>
        <Checkbox
          checked={selected}
          onChange={() => onToggle(diagram.id)}
          inputProps={{
            "aria-label": `Select ${diagram.locationName} / ${diagram.subLocationName}`,
          }}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            p: 0.5,
            bgcolor: "rgba(255,255,255,0.92)",
            borderRadius: 1,
            "&:hover": { bgcolor: "#fff" },
          }}
        />
        <Chip
          size="small"
          label={`${counts.total ?? 0} point${counts.total === 1 ? "" : "s"}`}
          sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(13, 71, 161, 0.9)", color: "#fff", fontWeight: 600 }}
        />
      </Box>

      {/* Category / area */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Location Category
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="primary" noWrap title={diagram.locationName} sx={{ lineHeight: 1.3 }}>
          {diagram.locationName || "-"}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
          Location
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap title={diagram.subLocationName}>
          {diagram.subLocationName || "-"}
        </Typography>
      </Box>

      {/* Counts */}
      <Box sx={{ px: 2, pb: 1.5, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75, flexGrow: 1, alignContent: "start" }}>
        {COUNT_LABELS.map(([key, label]) => (
          <Box key={key} sx={{ bgcolor: COUNT_COLORS[key].bg, borderRadius: 1.5, py: 0.75, textAlign: "center" }}>
            <Typography variant="body2" fontWeight={700} color={COUNT_COLORS[key].color}>
              {counts[key] ?? 0}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", whiteSpace: "nowrap" }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      <Divider />
      <Box sx={{ px: 1.5, py: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Button size="small" endIcon={<ChevronRightIcon />} sx={{ textTransform: "none", fontWeight: 600, mr: "auto" }} onClick={openPoints}>
          Open points
        </Button>
        <Tooltip title="Update this diagram">
          <IconButton
            size="small"
            color="primary"
            aria-label="Update diagram"
            onClick={() =>
              navigate(`/vessels/new-area?mode=update&diagram=${diagram.id}`)
            }
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete this diagram">
          <IconButton
            size="small"
            color="error"
            aria-label="Delete diagram"
            onClick={() => onDelete(diagram)}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

const LocationDiagramPage = () => {
  const vessel = useRecoilValue(commonVesselViewState);
  const locationCategories = useRecoilValue(LocationSelector);
  const locations = useRecoilValue(SubLocationSelector);
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  // { ids, label, points } while the delete confirmation is open
  const [pendingDelete, setPendingDelete] = useState(null);

  // "Save Area" redirects here and passes its confirmation along, since the
  // crop page is gone by the time the toast would render.
  const routerLocation = useLocation();
  const pageNavigate = useNavigate();
  const flash = routerLocation.state?.flash;

  useEffect(() => {
    if (!flash) return;
    toast.success(flash);
    // Drop it from history so a refresh or Back does not replay the message.
    pageNavigate(routerLocation.pathname, { replace: true, state: null });
  }, [flash, pageNavigate, routerLocation.pathname]);

  const locationDiagrams = useQuery({
    queryKey: ["locationDiagrams", page, searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/location-diagrams/${vessel.id}`,
        {
          // All diagrams on one page, so Select All really covers them all.
          params: { page, limit: 1000, search: searchQuery },
        }
      );

      return response.data;
    },
    select: (data) =>
      data.data.locationDiagrams.map((diagram) => ({
        id: diagram.id,
        locationName: diagram.location.name,
        subLocationName: diagram.subLocation.name,
        imageId: diagram.LocationDiagramImage[0]?.id,
        imageUrl: diagram.LocationDiagramImage[0]?.url,
        userName: diagram.user?.name,
        vesselType: diagram.vessel.vesselType,
        pinCounts: diagram.pinCounts,
      })),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  // Client-side dropdown filters over the loaded location diagrams.
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    subLocation: "",
    vesselType: "",
  });

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const items = !locationDiagrams.isPending ? locationDiagrams.data ?? [] : [];

  const optionsFrom = (values) =>
    [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => ({ label: String(v), value: String(v) }));

  // Location Category / Location list every value from the master lists, not
  // only the ones already used by a diagram.
  const filters = useMemo(
    () => [
      {
        name: "location",
        value: selectedFilters.location,
        placeholder: "Location Category",
        label: "Location Category",
        allLabel: "All Categories",
        options: optionsFrom((locationCategories ?? []).map((l) => l?.name)),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Location",
        label: "Location",
        allLabel: "All Locations",
        options: optionsFrom((locations ?? []).map((l) => l?.name)),
      },
      {
        name: "vesselType",
        value: selectedFilters.vesselType,
        placeholder: "Vessel Type",
        label: "Vessel Type",
        allLabel: "All Types",
        options: optionsFrom(items.map((i) => i?.vesselType)),
      },
    ],
    [items, selectedFilters, locationCategories, locations]
  );

  const filteredDiagrams = items.filter(
    (i) =>
      (!selectedFilters.location || i?.locationName === selectedFilters.location) &&
      (!selectedFilters.subLocation ||
        i?.subLocationName === selectedFilters.subLocation) &&
      (!selectedFilters.vesselType || i?.vesselType === selectedFilters.vesselType)
  );

  // Select All / Unselect All / Delete Selected act on the diagrams on screen.
  const visibleIds = filteredDiagrams.map((d) => d.id);
  const visibleKey = visibleIds.join(",");

  useEffect(() => {
    // Forget selections that are filtered out or already deleted.
    setSelectedIds((prev) => prev.filter((id) => visibleIds.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  const toggleSelected = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const askDelete = (diagrams) => {
    if (diagrams.length === 0) return;
    setPendingDelete({
      ids: diagrams.map((d) => d.id),
      points: diagrams.reduce((sum, d) => sum + (d.pinCounts?.total ?? 0), 0),
      label:
        diagrams.length === 1
          ? `"${diagrams[0].locationName} / ${diagrams[0].subLocationName}"`
          : `${diagrams.length} location diagrams`,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      const response =
        ids.length === 1
          ? await axiosInstance.delete(`/location-diagrams/${vessel.id}/${ids[0]}`)
          : await axiosInstance.post(`/location-diagrams/${vessel.id}/bulk-delete`, {
              ids,
            });
      return response.data.data;
    },
    onSuccess: ({ deleted, inventoryPointsDeleted }) => {
      toast.success(
        `Deleted ${deleted} location diagram(s)` +
          (inventoryPointsDeleted
            ? ` and ${inventoryPointsDeleted} inventory point(s).`
            : ".")
      );
      setSelectedIds([]);
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["locationDiagrams"] });
      queryClient.invalidateQueries({ queryKey: ["locationDiagramsForUpdate"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Could not delete the location diagram(s)."
      );
    },
  });

  const totalPoints = items.reduce((sum, d) => sum + (d.pinCounts?.total ?? 0), 0);

  return (
    <OPPageContainer sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "#f4f6fa", minHeight: "calc(100vh - 64px)", boxSizing: "border-box" }}>
      <ListPageHeader
        icon={MapIcon}
        title="Location Diagram"
        subtitle={`${vessel?.name ? `${vessel.name} · ` : ""}${items.length} diagram${items.length === 1 ? "" : "s"} · ${totalPoints} inventory point${totalPoints === 1 ? "" : "s"}`}
        actions={
          <Button
            variant="contained"
            startIcon={<CropIcon />}
            onClick={() => pageNavigate("/vessels/new-area")}
            sx={headerButtonSx}
          >
            Mark New Area
          </Button>
        }
        search={{ placeholder: "Location name", value: searchQuery, onChange: handleSearchChange }}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Selection toolbar */}
      <Box
        sx={{
          mb: 2.5,
          px: 2,
          py: 1.25,
          borderRadius: 3,
          border: "1px solid",
          borderColor: selectedIds.length ? "error.light" : "divider",
          bgcolor: selectedIds.length ? "#fff5f5" : "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
          {selectedIds.length
            ? `${selectedIds.length} selected`
            : `${filteredDiagrams.length} diagram${filteredDiagrams.length === 1 ? "" : "s"} shown`}
        </Typography>
        <Button
          size="small"
          startIcon={<SelectAllIcon />}
          onClick={() => setSelectedIds(visibleIds)}
          disabled={visibleIds.length === 0}
          sx={{ textTransform: "none" }}
        >
          Select All
        </Button>
        <Button
          size="small"
          startIcon={<DeselectIcon />}
          onClick={() => setSelectedIds([])}
          disabled={selectedIds.length === 0}
          sx={{ textTransform: "none" }}
        >
          Unselect All
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={selectedIds.length === 0}
          onClick={() =>
            askDelete(filteredDiagrams.filter((d) => selectedIds.includes(d.id)))
          }
          sx={{ textTransform: "none" }}
        >
          Delete Selected
        </Button>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
        gap={2.5}
      >
        {locationDiagrams.isPending &&
          [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: 3 }} />)}
        {filteredDiagrams.map((diagram) => (
          <DiagramCard
            key={diagram.id}
            diagram={diagram}
            avatarSrc={
              import.meta.env.VITE_API_URL + "/uploads/" + diagram.imageUrl
            }
            selected={selectedIds.includes(diagram.id)}
            onToggle={toggleSelected}
            onDelete={(d) => askDelete([d])}
          />
        ))}
      </Box>

      {!locationDiagrams.isPending && filteredDiagrams.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          <SearchOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 1 }}>No location diagrams to show.</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {items.length ? "Try a different search or clear the filters." : "Mark a new area to create the first one."}
          </Typography>
          {!items.length && (
            <Button variant="contained" startIcon={<CropIcon />} onClick={() => pageNavigate("/vessels/new-area")} sx={{ textTransform: "none" }}>
              Mark New Area
            </Button>
          )}
        </Box>
      )}

      <Dialog
        open={!!pendingDelete}
        onClose={() => !deleteMutation.isPending && setPendingDelete(null)}
      >
        <DialogTitle>Delete {pendingDelete?.label}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete?.points
              ? `This also permanently deletes ${pendingDelete.points} inventory point(s) on ${
                  pendingDelete.ids.length === 1 ? "this diagram" : "these diagrams"
                }, with their hazmat data, images and attachments. `
              : "There are no inventory points on it. "}
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPendingDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMutation.mutate(pendingDelete.ids)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </OPPageContainer>
  );
};

export default LocationDiagramPage;
