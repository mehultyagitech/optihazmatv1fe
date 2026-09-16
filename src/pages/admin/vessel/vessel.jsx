import { useCallback, useState, useMemo } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Skeleton,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import BusinessIcon from "@mui/icons-material/Business";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import VesselTopBar from "../../../components/vesselTopBar";
import useVessel from "../../../api/services/useVessel";
import { useRecoilState, useRecoilValue } from "recoil";
import { ClientSelector, ManagerSelector } from "../../../utils/States/Generic";
import { searchState } from "../../../utils/States/Search";
import debounce from "lodash.debounce";
import { useSetRecoilState } from "recoil";
import { vesselState, commonVesselViewState } from "../../../utils/States/Vessel";

// useVessel falls back to a generic avatar service when a vessel has no photo;
// a ship icon reads better than a random person.
const hasPhoto = (src) => !!src && !src.includes("avatar.iran.liara.run");

const blank = (value) => (value && value !== "-" ? value : "—");

const DetailRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Icon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap title={value}>
                {blank(value)}
            </Typography>
        </Box>
    </Box>
);

const ClientCard = ({ avatarSrc, vessel, imoNumber, clientName, managerName, vesselType, clientId }) => {
    const setVesselState = useSetRecoilState(vesselState);
    const [commonVesselView, setCommonVesselViewState] = useRecoilState(commonVesselViewState);
    const isSelected = commonVesselView?.id === clientId;

    const handleEdit = () => {
        setVesselState({
            id: clientId,
            open: true,
            imoNumber,
            vesselName: vessel,
            vesselType,
            clientName,
            avatarSrc,
            managerName
        });
    }

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
                borderColor: isSelected ? "primary.main" : "divider",
                boxShadow: isSelected ? "0 0 0 1px #1976d2" : "0 1px 3px rgba(15, 23, 42, 0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(13, 71, 161, 0.16)" },
            }}
        >
            {/* Photo band */}
            <Box
                sx={{
                    position: "relative",
                    height: 120,
                    background: "linear-gradient(135deg, #0b2a5b 0%, #1565c0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {hasPhoto(avatarSrc) ? (
                    <Box component="img" src={avatarSrc} alt={vessel} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <DirectionsBoatIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.35)" }} />
                )}
                {isSelected && (
                    <Chip
                        size="small"
                        icon={<CheckCircleIcon />}
                        label="Selected"
                        sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            bgcolor: "#fff",
                            color: "#0d47a1",
                            fontWeight: 700,
                            "& .MuiChip-icon": { color: "#2e7d32" },
                        }}
                    />
                )}
            </Box>

            {/* Name + IMO */}
            <Box sx={{ px: 2, pt: 1.5, pb: 1.25, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, mt: -3.5, border: "3px solid #fff", bgcolor: "#e3f2fd", color: "#0d47a1" }}>
                    <DirectionsBoatIcon fontSize="small" />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="primary"
                        title={vessel}
                        sx={{
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                        }}
                    >
                        {vessel}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.75 }}>
                        <Chip size="small" label={`IMO ${blank(imoNumber)}`} sx={{ fontWeight: 600, bgcolor: "#f1f5f9" }} />
                        {vesselType && (
                            <Chip size="small" label={vesselType} variant="outlined" sx={{ maxWidth: "100%" }} />
                        )}
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Client / manager */}
            <Box sx={{ px: 2, py: 1.5, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5, flexGrow: 1, alignContent: "start" }}>
                <DetailRow icon={BusinessIcon} label="Client" value={clientName} />
                <DetailRow icon={ManageAccountsIcon} label="Manager" value={managerName} />
            </Box>

            <Divider />

            {/* Actions */}
            <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
                <Button
                    fullWidth
                    variant={isSelected ? "outlined" : "contained"}
                    size="small"
                    startIcon={<VisibilityOutlinedIcon />}
                    disableElevation
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    onClick={() => setCommonVesselViewState({ id: clientId, name: vessel })}
                >
                    {isSelected ? "Viewing" : "View"}
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    onClick={() => handleEdit()}
                >
                    Edit
                </Button>
            </Box>
        </Card>
    );
};


const Vessel = () => {
    const { getVessels } = useVessel();
    const { data, isSuccess, isPending } = getVessels();
    const [ search, setSearch ]  = useRecoilState(searchState);
    const [inputValue, setInputValue] = useState(search);

    const debouncedSetSearch = useCallback(
        debounce((value) => {
            setSearch(value);
        }, 500),
        []
    );

    const handleSearchChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        debouncedSetSearch(newValue);
    };

    // Dropdown filters (client-side, over the loaded vessels)
    const [dropdownFilters, setDropdownFilters] = useState({
        client: "",
        manager: "",
        vesselType: "",
    });

    const handleDropdownFilterChange = (name, value) => {
        setDropdownFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Full client/manager lists from /generics, refreshed after adds/deletes.
    const allClients = useRecoilValue(ClientSelector);
    const allManagers = useRecoilValue(ManagerSelector);

    const vessels = isSuccess ? data : [];

    const uniqueSorted = (arr) =>
        [...new Set(arr.filter((v) => v && v !== "-"))].sort((a, b) =>
            String(a).localeCompare(String(b))
        );

    // Built from the client/manager lists, not just the loaded vessels, so a
    // newly added client or manager shows up before it has any vessel. Vessel
    // names are merged in so the options never go empty while those load.
    const clientOptions = useMemo(
        () =>
            uniqueSorted([
                ...allClients.map((c) => c.companyName),
                ...vessels.map((v) => v.clientName2),
            ]),
        [allClients, vessels]
    );
    const managerOptions = useMemo(
        () =>
            uniqueSorted([
                ...allManagers.map((m) => m.companyName),
                ...vessels.map((v) => v.managerName2),
            ]),
        [allManagers, vessels]
    );
    const typeOptions = useMemo(
        () => uniqueSorted(vessels.map((v) => v.vesselType)),
        [vessels]
    );

    const filteredClients = vessels.filter(
        (v) =>
            (!dropdownFilters.client || v.clientName2 === dropdownFilters.client) &&
            (!dropdownFilters.manager || v.managerName2 === dropdownFilters.manager) &&
            (!dropdownFilters.vesselType || v.vesselType === dropdownFilters.vesselType)
    );

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "#f4f6fa", minHeight: "100%", boxSizing: "border-box" }}>
            <VesselTopBar
                clientOptions={clientOptions}
                managerOptions={managerOptions}
                typeOptions={typeOptions}
                filters={dropdownFilters}
                onFilterChange={handleDropdownFilterChange}
                searchValue={inputValue}
                onSearchChange={handleSearchChange}
                shownCount={isSuccess ? filteredClients.length : undefined}
            />

            <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
                gap={2.5}
            >
                {isPending &&
                    [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={330} sx={{ borderRadius: 3 }} />)}
                {filteredClients.map((client) => (
                    <ClientCard
                        key={client.id}
                        clientId={client.id}
                        avatarSrc={client.avatarSrc}
                        imoNumber={client.imoNumber}
                        vessel={client.vessel}
                        clientName={client.clientName2}  // <-- use company name
                        managerName={client.managerName2}
                        vesselType={client.vesselType}
                    />
                ))}
            </Box>

            {isSuccess && filteredClients.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                    <SearchOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mt: 1 }}>No vessels found</Typography>
                    <Typography variant="body2">Try a different search or clear the filters.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default Vessel;
