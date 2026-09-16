import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StorageIcon from "@mui/icons-material/Storage";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ImageIcon from "@mui/icons-material/Image";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ListPageHeader, { headerButtonSx, headerOutlinedButtonSx } from "../../../components/ListPageHeader";
import OPPageContainer from "../../../components/OPPageContainer";
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

const STATUS_STYLE = {
  Active: { color: "success" },
  Removed: { color: "error" },
  Replaced: { color: "warning" },
};

const InventoryPointCard = ({
  point,
  inventoryPointName,
  avatarSrc,
  inventoryPointNumber,
  hazmats,
  status,
  inventoryType,
  selected,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const hazmatNames = (point?.PinHazmat ?? []).map((h) => h.hazmat?.name).filter(Boolean);
  const hasImage = avatarSrc && !String(avatarSrc).endsWith("/undefined") && !imageFailed;
  const where = [point?.locationDiagram?.location?.name, point?.locationDiagram?.subLocation?.name].filter(Boolean).join(" / ");

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
      {/* Image */}
      <Box sx={{ position: "relative", height: 130, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        {hasImage ? (
          <Box component="img" src={avatarSrc} alt={inventoryPointName} onError={() => setImageFailed(true)} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Inventory2Icon sx={{ fontSize: 48, color: "#b0bec5" }} />
        )}
        <Checkbox
          checked={selected}
          onChange={onToggle}
          inputProps={{ "aria-label": `Select ${inventoryPointName}` }}
          sx={{ position: "absolute", top: 8, left: 8, p: 0.5, bgcolor: "rgba(255,255,255,0.92)", borderRadius: 1, "&:hover": { bgcolor: "#fff" } }}
        />
        <Chip
          size="small"
          label={`#${inventoryPointNumber ?? "-"}`}
          sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(13, 71, 161, 0.9)", color: "#fff", fontWeight: 700 }}
        />
      </Box>

      {/* Name */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary" noWrap title={inventoryPointName} sx={{ lineHeight: 1.3 }}>
            {inventoryPointName || "-"}
          </Typography>
          <Chip size="small" variant="outlined" label={status || "-"} color={STATUS_STYLE[status]?.color ?? "default"} sx={{ fontWeight: 600, flexShrink: 0 }} />
        </Box>
        {where && (
          <Typography variant="caption" color="text.secondary" noWrap component="div" title={where} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PlaceOutlinedIcon sx={{ fontSize: 14 }} /> {where}
          </Typography>
        )}
      </Box>

      {/* Details */}
      <Box sx={{ px: 2, pb: 1.5, display: "flex", flexDirection: "column", gap: 1.25, flexGrow: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Hazmats</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.25 }}>
            {hazmatNames.length ? (
              hazmatNames.map((name, i) => (
                <Chip key={`${name}-${i}`} size="small" label={name} sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600, maxWidth: "100%" }} />
              ))
            ) : (
              <Typography variant="body2" fontWeight={600}>{hazmats && hazmats !== "-" ? hazmats : "-"}</Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" component="div">Inventory Point</Typography>
            <Typography variant="body2" fontWeight={600}>{inventoryPointNumber ?? "-"}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" component="div">Inventory Type</Typography>
            <Typography variant="body2" fontWeight={600} noWrap title={inventoryType}>{inventoryType || "-"}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />
      <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
        <Button fullWidth variant="contained" disableElevation size="small" startIcon={<EditOutlinedIcon />} sx={{ textTransform: "none", fontWeight: 600 }} onClick={onEdit}>
          Edit
        </Button>
        <Tooltip title="Delete inventory point">
          <IconButton size="small" color="error" onClick={onDelete} aria-label="Delete inventory point" sx={{ border: "1px solid", borderColor: "error.light", borderRadius: 1.5 }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

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
        label: "Inventory Type",
        allLabel: "All Types",
        options: optionsFrom([
          ...(Inventory ?? []).map((i) => i?.name),
          selectedFilters.inventoryType,
        ]),
      },
      {
        name: "status",
        value: selectedFilters.status,
        placeholder: "Status",
        label: "Status",
        allLabel: "All Statuses",
        options: STATUSES.map((s) => ({ label: s, value: s })),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Sub-Location",
        label: "Sub-Location",
        allLabel: "All Sub-Locations",
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
    <OPPageContainer sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "#f4f6fa", minHeight: "calc(100vh - 64px)", boxSizing: "border-box" }}>
      <Box>
        <ListPageHeader
          icon={Inventory2Icon}
          title="Inventory Points"
          subtitle={`${vesselView?.name ? `${vesselView.name} · ` : ""}${meta.total?.items ?? items.length} inventory point${(meta.total?.items ?? items.length) === 1 ? "" : "s"}`}
          actions={
            <>
              <Button
                variant="contained"
                startIcon={<StorageIcon />}
                endIcon={<ArrowDropDownIcon />}
                disabled={applying}
                onClick={(e) => setCommonMenuAnchor(e.currentTarget)}
                sx={headerButtonSx}
              >
                {applying ? "Updating..." : "Update Common Data"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                disabled={exporting || !vesselView?.id}
                onClick={exportToExcel}
                sx={headerOutlinedButtonSx}
              >
                {exporting ? "Exporting..." : "Export to Excel"}
              </Button>
            </>
          }
          search={{ placeholder: "Inventory points", value: searchQuery, onChange: handleSearchChange }}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
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

        {/* Selection toolbar */}
        <Box
          sx={{
            mb: 2.5,
            px: 2,
            py: 0.75,
            borderRadius: 3,
            border: "1px solid",
            borderColor: selectedIds.size ? "primary.light" : "divider",
            bgcolor: selectedIds.size ? "#f0f7ff" : "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
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
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {selectedIds.size
              ? "Use Update Common Data to apply shared values to the selected points."
              : `${filteredClients.length} shown on this page`}
          </Typography>
        </Box>

        <Box
          display="grid"
          // As many 280px+ columns as fit, so cards never get squeezed.
          gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
          gap={2.5}
        >
          {pinsListing.isPending &&
            [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={340} sx={{ borderRadius: 3 }} />)}
          {pinsListing.isSuccess &&
            filteredClients?.map((inventoryPoint) => (
              <InventoryPointCard
                key={inventoryPoint.id}
                point={inventoryPoint}
                inventoryPointName={inventoryPoint?.subLocation?.name}
                avatarSrc={avatarFor(inventoryPoint)}
                inventoryPointNumber={inventoryPoint?.inventoryPointNumber}
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
        {pinsListing.isSuccess && filteredClients.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <SearchOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>No inventory points match these filters.</Typography>
            <Typography variant="body2">Try a different search or clear the filters.</Typography>
          </Box>
        )}
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
