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
import LocationDiagramTopBar from "../../../components/locationDiagramTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
// import AddEditVesselDrawer from "./addEditVesselDrawer";

const ClientCard = ({ avatarSrc, vessel, imoNumber, clientName, managerName, vesselType, onEdit }) => (
    <OPCard sx={{ width: "100%" }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: "#1976d2" }}
                >
                    {vessel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Vessel
                </Typography>
            </Box>
            <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform: "none", marginLeft: "auto" }}
                onClick={() => onEdit({ vessel, clientName, vesselType })}
            >
                Edit
            </Button>
        </Box>
        <OPDivider />
        <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                >
                    IMO Number
                </Typography>
                <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                    {imoNumber}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                >
                    Client Name
                </Typography>
                <Typography fontWeight="bold"  variant="body2" color="text.primary" mb={2}>
                    {clientName}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                >
                    Manager Name
                </Typography>
                <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                    {managerName}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                >
                    Vessel Type
                </Typography>
                <Typography fontWeight="bold" variant="body2" color="text.primary">
                    {vesselType}
                </Typography>
            </Grid>
        </Grid>
    </OPCard>
);


const Vessel = () => {
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
            vessel: "A LA MARINE",
            imoNumber: "123456789",
            clientName: "ACECHEM",
            managerName: "John Doe",
            vesselType: "Crude Oil Tanker",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/5",
            vessel: "ADIYAMAN SCHGE",
            imoNumber: "123456789",
            clientName: "BETA LTD",
            managerName: "John Doe",
            vesselType: "Crude Oil Tanker",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/31",
            vessel: "ADAM SCHULTE",
            imoNumber: "123456789",
            clientName: "OMEGA INC",
            managerName: "John Doe",
            vesselType: "Crude Oil Tanker",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/24",
            vessel: "A LA MARINE",
            imoNumber: "123456789",
            clientName: "DELTA CORP",
            managerName: "John Doe",
            vesselType: "General Cargo Ship",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/9",
            vessel: "ACER ARROW",
            imoNumber: "123456789",
            clientName: "ZETA LTD",
            managerName: "John Doe",
            vesselType: "Crude Oil Tanker",
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
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.vessel.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <OPPageContainer sx={{ px: 2, pt: 2 }}>
            <Box>
                <LocationDiagramTopBar filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />
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
                <OPDivider />
                <Box
                    p={3}
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
                    gap={3}
                >
                    {filteredClients.map((client, index) => (
                        <ClientCard
                            key={index}
                            avatarSrc={client.avatarSrc}
                            imoNumber={client.imoNumber}
                            vessel={client.vessel}
                            clientName={client.clientName}
                            managerName={client.managerName}
                            vesselType={client.vesselType}
                        />
                    ))}
                </Box>
            </Box>
        </OPPageContainer>
    );
};

export default Vessel;
