import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import LocationDiagramTopBar from "../../../components/locationDiagramTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import InfoCard from "../../../components/InfoCard";
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

const DiagramCard = ({ diagram, avatarSrc, selected, onToggle, onDelete }) => {
  const navigate = useNavigate();
  const counts = diagram.pinCounts ?? {};
  const openPoints = () => navigate(`/vessels/inventory-points/${diagram.id}`);

  return (
    <InfoCard
      selectable
      selected={selected}
      onToggle={() => onToggle(diagram.id)}
      avatarSrc={avatarSrc}
      avatarVariant="rounded"
      title={diagram.locationName}
      subtitle={diagram.subLocationName}
      onOpen={openPoints}
      fields={COUNT_LABELS.map(([key, label]) => ({ label, value: counts[key] ?? 0 }))}
      actions={
        <>
          <Button size="small" sx={{ textTransform: "none", mr: "auto" }} onClick={openPoints}>
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
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete this diagram">
            <IconButton
              size="small"
              color="error"
              aria-label="Delete diagram"
              onClick={() => onDelete(diagram)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    />
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

  const handleSearch = () => {
    locationDiagrams.refetch();
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
        options: optionsFrom((locationCategories ?? []).map((l) => l?.name)),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Location",
        options: optionsFrom((locations ?? []).map((l) => l?.name)),
      },
      {
        name: "vesselType",
        value: selectedFilters.vesselType,
        placeholder: "Vessel Type",
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

  return (
    <OPPageContainer sx={{ px: 2, pt: 2 }}>
      <Box>
        <LocationDiagramTopBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          flexWrap={{ xs: "wrap", sm: "nowrap" }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={{ xs: 2, sm: 0 }}
            flexGrow={{ xs: 1, sm: 0 }}
          >
            Location Diagram
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            justifyContent={{ xs: "center", sm: "flex-end" }}
          >
            <TextField
              variant="outlined"
              label="Location Name"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: { xs: "100%", sm: "auto" } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton type="button" aria-label="search" size="small">
                      <SearchIcon />
                    </IconButton>
                  ),
                  sx: { pr: 0.5 },
                },
              }}
            />
          </Box>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          px={2}
          pb={1}
          flexWrap="wrap"
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelectedIds(visibleIds)}
            disabled={visibleIds.length === 0}
          >
            Select All
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
          >
            Unselect All
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selectedIds.length === 0}
            onClick={() =>
              askDelete(filteredDiagrams.filter((d) => selectedIds.includes(d.id)))
            }
          >
            Delete Selected
          </Button>
          <Typography variant="body2" color="text.secondary">
            {selectedIds.length} selected
          </Typography>
        </Box>

        <OPDivider />
        {!locationDiagrams.isPending && filteredDiagrams.length === 0 && (
          <Typography color="text.secondary" p={3}>
            No location diagrams to show.
          </Typography>
        )}
        <Box
          p={3}
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
          gap={3}
        >
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
      </Box>

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
