import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    TextField,
    IconButton,
    Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InventoryPointTopBar from "../../../components/inventoryPointTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import DeleteIcon from "@mui/icons-material/Delete";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
// import AddEditVesselDrawer from "./addEditVesselDrawer";

const InventoryPointCard = ({ avatarSrc, location, inventoryPointNumber, hazmats, status, inventoryType, onEdit, onDelete }) => (
    <OPCard sx={{ width: "100%" }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1976d2" }}>
                    {location}
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
                    onClick={() => onEdit({ avatarSrc, location, inventoryPointNumber, hazmats, status, inventoryType })}
                >
                    Edit
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    sx={{ textTransform: "none", color: "error.main", borderColor: "error.main" }}
                    onClick={() => onDelete(inventoryPointNumber)}
                >
                    Delete
                </Button>
            </Box>
        </Box>
        <OPDivider />
        <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Inventory Number
                </Typography>
                <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                    {inventoryPointNumber}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Hazmats
                </Typography>
                <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
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
                <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                    {status}
                </Typography>
            </Grid>
        </Grid>
    </OPCard>
);




const InventoryPoints = () => {
    const handleSearch = () => {
        const selectedFilters = filters.reduce((acc, filter) => {
            acc[filter.name] = filter.value;
            return acc;
        }, {});
        console.log("Selected Filters:", selectedFilters);
    };
    const [filters, setFilters] = useState([
        {
            name: "client",
            value: "",
            placeholder: "Client",
            options: [
                { label: "Client 1", value: "client1" },
                { label: "Client 2", value: "client2" },
            ],
        },
        {
            name: "fleetManager",
            value: "",
            placeholder: "Fleet Manager",
            options: [
                { label: "Manager 1", value: "manager1" },
                { label: "Manager 2", value: "manager2" },
            ],
        },
        {
            name: "vessel",
            value: "",
            placeholder: "Vessel",
            options: [
                { label: "Vessel 1", value: "vessel1" },
                { label: "Vessel 2", value: "vessel2" },
            ],
        },
    ]);
    const handleFilterChange = (name, value) => {
        setFilters((prevFilters) =>
            prevFilters.map((filter) =>
                filter.name === name ? { ...filter, value } : filter
            )
        );
    };
    const [clients, setClients] = useState([
        {
            avatarSrc: "https://avatar.iran.liara.run/public/33",
            location: "Tween Deck",
            inventoryPointNumber: "SS-003-I [IHM Survey]",
            hazmats: "Asb",
            status: "John Doe",
            inventoryType: "Crude Oil Tanker",
        },
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("clients");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleToggleChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    const filteredClients = clients.filter((client) =>
        client.hazmats.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.vessel.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const [actionType, setActionType] = useState(""); // "edit" or "delete"
    const [selectedData, setSelectedData] = useState(null);
    const handleOpenDrawer = (type, inventoryPointData) => {
        setActionType(type);
        setSelectedData(inventoryPointData);
        setDrawerOpen(true);
    };
    

    return (
        <OPPageContainer sx={{ px: 2, pt: 2 }}>
            <Box>
                <InventoryPointTopBar filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />
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
                        Inventory Points
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
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
                    gap={3}
                >
                    {filteredClients.map((inventoryPoint, index) => (
                        <InventoryPointCard
                            key={index}
                            avatarSrc={inventoryPoint.avatarSrc}
                            inventoryPointNumber={inventoryPoint.inventoryPointNumber}
                            location={inventoryPoint.location}
                            hazmats={inventoryPoint.hazmats}
                            inventoryType={inventoryPoint.inventoryType}
                            status={inventoryPoint.status}
                            onEdit={(data) => handleOpenDrawer("edit", data)}  // ✅ Fixed
                            onDelete={(inventoryPointNumber) => console.log(`Delete ${inventoryPointNumber}`)}
                        />
                    ))}
                </Box>
            </Box>
            {drawerOpen && (
                <AddEditInventoryPointDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    actionType={actionType}
                    inventoryPointData={selectedData}
                />
            )}
        </OPPageContainer>
    );
};

export default InventoryPoints;
