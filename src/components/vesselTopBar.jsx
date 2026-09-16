import {
    Box,
    Button,
    InputAdornment,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddEditVesselDrawer from "../pages/admin/vessel/addEditVesselDrawer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { vesselSearchMetaState, vesselState } from "../utils/States/Vessel";

// Label above the select (white on the header) instead of floating in its border.
const FilterSelect = ({ label, allLabel, value, options, onChange }) => (
    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 190px" }, minWidth: 0 }}>
        <Typography variant="caption" component="div" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            {label}
        </Typography>
        <TextField
            select
            fullWidth
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            inputProps={{ "aria-label": label }}
            sx={{
                "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 },
                "& .MuiOutlinedInput-notchedOutline": { border: 0 },
            }}
        >
            <MenuItem value="">{allLabel}</MenuItem>
            {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
        </TextField>
    </Box>
);

const VesselTopBar = ({
    clientOptions = [],
    managerOptions = [],
    typeOptions = [],
    filters = { client: "", manager: "", vesselType: "" },
    onFilterChange = () => {},
    searchValue = "",
    onSearchChange = () => {},
    shownCount,
}) => {
    const setVessel = useSetRecoilState(vesselState);
    const vesselMeta = useRecoilValue(vesselSearchMetaState);
    const total = vesselMeta?.total || 0;
    const hasFilters = Object.values(filters).some(Boolean);

    const handleDrawerToggle = () => {
        setVessel(prev => ({ id: '', open: !prev.open}));
    };

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    borderRadius: 3,
                    color: "#fff",
                    background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #26a69a 100%)",
                }}
            >
                <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
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
                                flexShrink: 0,
                            }}
                        >
                            <DirectionsBoatIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Vessels
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                {total} vessel{total === 1 ? "" : "s"} registered
                                {shownCount !== undefined && shownCount !== total ? ` · ${shownCount} shown` : ""}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleDrawerToggle}
                        sx={{ bgcolor: "#fff", color: "#0d47a1", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#e3f2fd" } }}
                    >
                        Add New Vessel
                    </Button>
                </Box>

                {/* Search + filters */}
                <Box
                    sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                        gap: 2,
                    }}
                >
                    <Box sx={{ flex: { xs: "1 1 100%", md: "2 1 260px" }, minWidth: 0 }}>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                            Search
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Vessel or client name"
                            value={searchValue}
                            onChange={onSearchChange}
                            inputProps={{ "aria-label": "Search vessel or client name" }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 },
                                "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                            }}
                        />
                    </Box>
                    <FilterSelect label="Client" allLabel="All Clients" value={filters.client} options={clientOptions} onChange={(v) => onFilterChange("client", v)} />
                    <FilterSelect label="Vessel Type" allLabel="All Types" value={filters.vesselType} options={typeOptions} onChange={(v) => onFilterChange("vesselType", v)} />
                    <FilterSelect label="Fleet Manager" allLabel="All Managers" value={filters.manager} options={managerOptions} onChange={(v) => onFilterChange("manager", v)} />
                    <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        disabled={!hasFilters}
                        onClick={() => ["client", "vesselType", "manager"].forEach((key) => onFilterChange(key, ""))}
                        sx={{
                            height: 40,
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.6)",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
                            "&.Mui-disabled": { color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>

            {/* Drawer Component */}
            <AddEditVesselDrawer />
            {/* Toasts from the drawer and its save (useVessel) render here. */}
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default VesselTopBar;
