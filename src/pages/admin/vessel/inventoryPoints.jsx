import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  TextField,
  IconButton,
  Grid,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ImageIcon from "@mui/icons-material/Image";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InventoryPointTopBar from "../../../components/inventoryPointTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import DeleteIcon from "@mui/icons-material/Delete";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import locationPointState, { locationPointAddDrawerState } from "../../../utils/States/LocationDiagram";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import genericState from "../../../utils/States/Generic";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import ReactPaginate from 'react-paginate';
import './../../../components/pagination.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { BATTERY_IMAGE_URL } from "../../../utils/batteryImage";

const STATUSES = ["Active", "Removed", "Replaced"];

// "Update Common Data" options (applied to the selected points).
const COMMON_DATA_ACTIONS = [
  { action: "commonImage", label: "Use Common Image from Vessel Form", icon: <ImageIcon fontSize="small" /> },
  { action: "commonReference", label: "Use Common Reference/Drawing No", icon: <EditIcon fontSize="small" /> },
  { action: "batteryImage", label: "Use Common Battery Image", icon: <BatteryChargingFullIcon fontSize="small" /> },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getUTCDate()).padStart(2, "0")}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
};

const uniqueNames = (values) => [...new Set(values.filter(Boolean))].join(", ");

const toExcelRow = (point) => ({
  "Inventory No": point.inventoryPointNumber ?? "",
  "Location Category": point.locationDiagram?.location?.name ?? "",
  "Location": point.locationDiagram?.subLocation?.name ?? "",
  "Sub Location": point.subLocation?.name ?? "",
  "Equipment": point.equipment?.name ?? "",
  "Compartment": point.compartment?.name ?? "",
  "Object":
    point.object?.name || uniqueNames((point.PinHazmat ?? []).map((h) => h.object?.name)),
  "Description": point.Description ?? "",
  "Inventory Type": point.inventoryType ?? "",
  "Hazmats": (point.PinHazmat ?? [])
    .map((h) => `${h.hazmat?.name ?? "-"} [${h.totalMass ?? 0} ${h.unit?.name ?? ""}]`.replace(" ]", "]"))
    .join("; "),
  "PCHM": point.isPCHM ? "Yes" : "No",
  "Manufacturer Brand": point.manufacturerBrand ?? "",
  "Reference No / Drawing No": point.referenceNo ?? "",
  "Remarks": point.remarks ?? "",
  "Installation Date": formatDate(point.installationDate),
  "Status": point.status ?? "",
  "Removed Date": formatDate(point.removedDate),
  "Removed Remarks": point.removedRemarks ?? "",
});

const InventoryPointCard = ({
  inventoryPointName,
  avatarSrc,
  location,
  inventoryPointNumber,
  hazmats,
  status,
  inventoryType,
  selected,
  onToggle,
  onEdit,
  onDelete,
}) => (
  <OPCard sx={{ width: "100%", boxSizing: "border-box" }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Checkbox
        checked={selected}
        onChange={onToggle}
        sx={{ p: 0 }}
        inputProps={{ "aria-label": `Select ${inventoryPointName}` }}
      />
      <Avatar src={avatarSrc} sx={{ width: 52, height: 52, flexShrink: 0 }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#1976d2", wordBreak: "break-word" }}
        >
          {inventoryPointName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inventory Point
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" ml="auto">
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          sx={{ textTransform: "none", mb: 1 }}
          onClick={() =>
            onEdit({
              avatarSrc,
              location,
              inventoryPointNumber,
              hazmats,
              status,
              inventoryType,
            })
          }
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            color: "error.main",
            borderColor: "error.main",
          }}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Box>
    </Box>
    <OPDivider />
    <Grid container spacing={2} mt={2}>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Inventory Point
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color="text.primary"
          mb={2}
        >
          {inventoryPointNumber}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Hazmats
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color="text.primary"
          mb={2}
        >
          {hazmats}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Inventory Type
        </Typography>
        <Typography fontWeight="bold" variant="body2" color="text.primary">
          {inventoryType}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Status
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color={status === "Active" ? "text.primary" : "error.main"}
          mb={2}
        >
          {status}
        </Typography>
      </Grid>
    </Grid>
  </OPCard>
);

const InventoryPoints = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [drawer, setDrawer] = useRecoilState(locationPointAddDrawerState);
  const vesselView = useRecoilValue(commonVesselViewState);
  const setLocationPoint = useSetRecoilState(locationPointState);
  const { Inventory } = useRecoilValue(genericState);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [commonMenuAnchor, setCommonMenuAnchor] = useState(null);
  const [applying, setApplying] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Inventory Type and Status are filtered by the API (the dashboard's IHM
  // Part 1 cards link here with ?inventoryType=i1 or ?status=Replaced);
  // Sub-Location filters the loaded page.
  const [selectedFilters, setSelectedFilters] = useState(() => ({
    inventoryType: searchParams.get("inventoryType") || "",
    status: searchParams.get("status") || "",
    subLocation: "",
  }));

  const listParams = {
    search: searchQuery,
    inventoryType: selectedFilters.inventoryType || undefined,
    status: selectedFilters.status || undefined,
  };

  const pinsListing = useQuery({
    queryKey: ["pinsListing", vesselView.id, page, searchQuery, selectedFilters.inventoryType, selectedFilters.status],
    queryFn: async () => {
      const response = await axiosInstance(`/pins/list/${vesselView?.id}`, {
        params: { ...listParams, page, limit },
      });
      return response.data;
    },
    select: (data) => data.data,
    keepPreviousData: true,
  });

  const handleDelete = async (pinId) => {
    if (!window.confirm("Are you sure you want to delete this inventory point?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/pins/${pinId}`);
      toast.success("Inventory Point deleted successfully");

      // Refetch the data after deletion
      pinsListing.refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete inventory point");
    }
  };

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "inventoryType" || name === "status") {
      setPage(1);
      setSelectedIds(new Set());
      const next = new URLSearchParams(searchParams);
      if (value) next.set(name, value);
      else next.delete(name);
      setSearchParams(next, { replace: true });
    }
  };

  const handleSearch = () => {
    pinsListing.refetch();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  // Raw items from API response
  const items = pinsListing.isSuccess ? pinsListing.data.data : [];

  const optionsFrom = (values) =>
    [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => ({ label: String(v), value: String(v) }));

  const filters = useMemo(
    () => [
      {
        name: "inventoryType",
        value: selectedFilters.inventoryType,
        placeholder: "Inventory Type",
        options: optionsFrom([
          ...(Inventory ?? []).map((i) => i?.name),
          selectedFilters.inventoryType,
        ]),
      },
      {
        name: "status",
        value: selectedFilters.status,
        placeholder: "Status",
        options: STATUSES.map((s) => ({ label: s, value: s })),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Sub-Location",
        options: optionsFrom(items.map((i) => i?.subLocation?.name)),
      },
    ],
    [items, selectedFilters, Inventory]
  );

  const matchesSubLocation = (i) =>
    !selectedFilters.subLocation ||
    String(i?.subLocation?.name) === selectedFilters.subLocation;

  const filteredClients = items.filter(matchesSubLocation);
  const VesselInventoryImage = pinsListing.isSuccess ? pinsListing.data.VesselInventoryImage : null;
  const meta = pinsListing.isSuccess ? pinsListing.data.meta : { page: 1, total: { pages: 1, items: 0 } };

  const allVisibleSelected =
    filteredClients.length > 0 && filteredClients.every((p) => selectedIds.has(p.id));
  const someVisibleSelected = filteredClients.some((p) => selectedIds.has(p.id));

  const toggleSelected = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = (checked) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredClients.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
      return next;
    });

  const applyCommonData = async (action) => {
    setCommonMenuAnchor(null);
    if (!selectedIds.size) {
      toast.info("Select the inventory points to update first.");
      return;
    }
    setApplying(true);
    try {
      const response = await axiosInstance.post(`/pins/${vesselView.id}/common-data`, {
        ids: [...selectedIds],
        action,
      });
      const updated = response.data?.data?.updated ?? 0;
      toast.success(`Updated ${updated} inventory point${updated === 1 ? "" : "s"}`);
      setSelectedIds(new Set());
      pinsListing.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update the inventory points");
    } finally {
      setApplying(false);
    }
  };

  // Every point matching the current filters, not just this page.
  const exportToExcel = async () => {
    setExporting(true);
    try {
      const response = await axiosInstance(`/pins/list/${vesselView?.id}`, {
        params: { ...listParams, page: 1, limit: 10000 },
      });
      const points = (response.data?.data?.data ?? []).filter(matchesSubLocation);
      if (!points.length) {
        toast.info("There are no inventory points to export.");
        return;
      }
      const sheet = XLSX.utils.json_to_sheet(points.map(toExcelRow));
      sheet["!cols"] = Object.keys(toExcelRow(points[0])).map((key) => ({
        wch: Math.max(key.length + 2, 16),
      }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Inventory Points");
      const vesselName = String(vesselView?.name || "Vessel").replace(/[^A-Za-z0-9_-]+/g, "_");
      XLSX.writeFile(workbook, `Inventory_Points_${vesselName}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Could not export the inventory points");
    } finally {
      setExporting(false);
    }
  };

  // ReactPaginate handler
  const handlePageClick = (event) => {
    setPage(event.selected + 1); // react-paginate is 0-based, API is 1-based
  };

  const avatarFor = (inventoryPoint) => {
    if (inventoryPoint?.useBatteryImage) return BATTERY_IMAGE_URL;
    if (VesselInventoryImage && (inventoryPoint?.useCommonImage || VesselInventoryImage.isMain)) {
      return import.meta.env.VITE_API_URL + "/uploads/" + VesselInventoryImage.url;
    }
    return import.meta.env.VITE_API_URL + "/uploads/" + inventoryPoint?.PinImages[0]?.url;
  };

  return (
    <OPPageContainer sx={{ px: 2, pt: 2 }}>
      <Box>
        <InventoryPointTopBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          gap={2}
          flexWrap="wrap"
        >
          <Typography variant="h5" fontWeight="bold">
            Inventory Points
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<StorageIcon />}
              endIcon={<ArrowDropDownIcon />}
              disabled={applying}
              onClick={(e) => setCommonMenuAnchor(e.currentTarget)}
              sx={{ textTransform: "none" }}
            >
              {applying ? "Updating..." : "Update Common Data"}
            </Button>
            <Menu
              anchorEl={commonMenuAnchor}
              open={!!commonMenuAnchor}
              onClose={() => setCommonMenuAnchor(null)}
            >
              {COMMON_DATA_ACTIONS.map(({ action, label, icon }) => (
                <MenuItem key={action} onClick={() => applyCommonData(action)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={!allVisibleSelected && someVisibleSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  disabled={!filteredClients.length}
                />
              }
              label={selectedIds.size ? `Select All (${selectedIds.size} selected)` : "Select All"}
            />
            <Button
              variant="outlined"
              color="success"
              startIcon={<FileDownloadIcon />}
              disabled={exporting || !vesselView?.id}
              onClick={exportToExcel}
              sx={{ textTransform: "none" }}
            >
              {exporting ? "Exporting..." : "Export to Excel"}
            </Button>
            <TextField
              variant="outlined"
              label="Inventory Points"
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
        <OPDivider />
        <Box
          p={3}
          display="grid"
          // minmax(0, 1fr): long names must not push cards into each other.
          gridTemplateColumns={{
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          }}
          gap={3}
        >
          {pinsListing.isSuccess && filteredClients.length === 0 && (
            <Typography color="text.secondary" sx={{ gridColumn: "1 / -1", textAlign: "center", py: 4 }}>
              No inventory points match these filters.
            </Typography>
          )}
          {pinsListing.isSuccess &&
            filteredClients?.map((inventoryPoint) => (
              <InventoryPointCard
                key={inventoryPoint.id}
                inventoryPointName={inventoryPoint?.subLocation?.name}
                avatarSrc={avatarFor(inventoryPoint)}
                inventoryPointNumber={inventoryPoint?.inventoryPointNumber}
                location={inventoryPoint?.location}
                hazmats={inventoryPoint?.hazmats}
                inventoryType={inventoryPoint?.inventoryType}
                status={inventoryPoint.status}
                selected={selectedIds.has(inventoryPoint.id)}
                onToggle={() => toggleSelected(inventoryPoint.id)}
                onEdit={() => {
                  setLocationPoint((prev) => ({
                    ...prev,
                    id: inventoryPoint.locationDiagram.id
                  }))

                  setDrawer({
                    open: true,
                    x: inventoryPoint.x,
                    y: inventoryPoint.y,
                    pinId: inventoryPoint.id,
                  })
                }}
                onDelete={() => handleDelete(inventoryPoint.id)}

              />
            ))}
        </Box>
        {/* Pagination */}
        {meta.total.pages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={meta.total.pages}
              forcePage={meta.page - 1}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              pageClassName={"page-item"}
              previousClassName={"page-item"}
              nextClassName={"page-item"}
              breakClassName={"page-item"}
              disabledClassName={"disabled"}
            />
          </Box>
        )}
      </Box>
      {drawer.open && <AddEditInventoryPointDrawer />}
      <ToastContainer position="top-right" autoClose={2500} />
    </OPPageContainer>
  );
};

export default InventoryPoints;
