import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    Avatar,
    TextField,
    IconButton,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClientManagerTopBar from "../../components/clientManagerTopBar";
import OPDivider from "../../components/OPDivider";
import OPPageContainer from "../../components/OPPageContainer";
import OPCard from "../../components/OPCard";

const ClientCard = ({ avatarSrc, vid, clientName, address }) => (
    <OPCard sx={{ width: "100%" }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: "#1976d2" }}
                >
                    {vid}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Vessel Client
                </Typography>
            </Box>
            <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform: "none", marginLeft: "auto" }}
            >
                Edit
            </Button>
        </Box>
        <OPDivider />
        <Box>
            <Typography
                variant="body2"
                fontWeight="bold"
                color="text.primary"
                mb={0.5}
            >
                Client Name
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                {clientName}
            </Typography>
            <Typography
                variant="body2"
                fontWeight="bold"
                color="text.primary"
                mb={0.5}
            >
                Address
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {address}
            </Typography>
        </Box>
    </OPCard>
);

const VesselClientManager = () => {
    const [clients, setClients] = useState([
        {
            avatarSrc: "https://avatar.iran.liara.run/public/33",
            vid: "VID: 412",
            clientName: "ACECHEM",
            address: "Guzin Sokak 9/1, Aydintepe Mah, Tuzla, 34947 Island, Turkey.",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/5",
            vid: "VID: 413",
            clientName: "BETA LTD",
            address: "Street 45, Industrial Area, Istanbul, Turkey.",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/31",
            vid: "VID: 414",
            clientName: "OMEGA INC",
            address: "Central Plaza, Ankara, Turkey.",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/24",
            vid: "VID: 415",
            clientName: "DELTA CORP",
            address: "Highway 12, Izmir, Turkey.",
        },
        {
            avatarSrc: "https://avatar.iran.liara.run/public/9",
            vid: "VID: 416",
            clientName: "ZETA LTD",
            address: "Park Avenue, Bursa, Turkey.",
        },
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("clients");

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleToggleChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    const filteredClients = clients.filter((client) =>
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.vid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <OPPageContainer>
            <Box>
                <ClientManagerTopBar />
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    flexWrap={{ xs: "wrap", sm: "nowrap" }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        mb={{ xs: 2, sm: 0 }}
                        flexGrow={{ xs: 1, sm: 0 }}
                    >
                        Client/Manager
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
                            label="VID or Client Name"
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
                        <ToggleButtonGroup
                            color="primary"
                            value={view}
                            exclusive
                            onChange={handleToggleChange}
                            size="small"
                        >
                            <ToggleButton value="clients">Clients</ToggleButton>
                            <ToggleButton value="managers">Managers</ToggleButton>
                        </ToggleButtonGroup>
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
                            vid={client.vid}
                            clientName={client.clientName}
                            address={client.address}
                        />
                    ))}
                </Box>
            </Box>
        </OPPageContainer>
    );
};

export default VesselClientManager;
