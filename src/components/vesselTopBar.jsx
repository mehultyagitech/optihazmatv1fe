import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    useMediaQuery,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddEditVesselDrawer from "../pages/admin/vessel/addEditVesselDrawer";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { vesselSearchMetaState, vesselState } from "../utils/States/Vessel";

const VesselTopBar = () => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [selectedClient, setSelectedClient] = React.useState('');
    const [selectedMiscellaneous, setSelectedMiscellaneous] = React.useState('');
    const [selectedFleetManager, setSelectedFleetManager ] = React.useState('');
    const setVessel = useSetRecoilState(vesselState);
    const vesselMeta = useRecoilValue(vesselSearchMetaState);

    // Function to toggle drawer visibility
    const handleDrawerToggle = () => {
        setVessel(prev => ({ id: '', open: !prev.open}));
    };

    return (
        <>
            {/* Top Bar */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2}
                py={1}
                flexDirection={isMobile ? "column" : "row"}
                gap={isMobile ? 2 : 0}
            >
                {/* Left Section */}
                <Typography
                    variant="body1"
                    display="flex"
                    alignItems="center"
                    sx={{ fontWeight: 500, textAlign: isMobile ? "center" : "left" }}
                >
                    <ContactPageIcon sx={{ mr: 1 }} />
                    Records Count: {vesselMeta?.total || 0}
                </Typography>

                {/* Right Section */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={isMobile ? 1 : 2}
                    flexWrap={isMobile ? "wrap" : "nowrap"}
                    justifyContent={isMobile ? "center" : "flex-end"}
                >
                    {/* Filters for Clients */}
                    <FormControl
                        sx={{ minWidth: 120 }}
                        size={isMobile ? "small" : "medium"}
                    >
                        <InputLabel id="clients-filter-label">Clients</InputLabel>
                        <Select
                            labelId="clients-filter-label"
                            id="clients-filter"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)} // Handle state here
                        >
                            <MenuItem value="client1">Client 1</MenuItem>
                            <MenuItem value="client2">Client 2</MenuItem>
                            <MenuItem value="client3">Client 3</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filters for Miscellaneous */}
                    <FormControl
                        sx={{ minWidth: 150 }}
                        size={isMobile ? "small" : "medium"}
                    >
                        <InputLabel id="miscellaneous-filter-label">Miscellaneous</InputLabel>
                        <Select
                            labelId="miscellaneous-filter-label"
                            id="miscellaneous-filter"
                            value={selectedMiscellaneous}
                            onChange={(e) => setSelectedMiscellaneous(e.target.value)} // Handle state here
                        >
                            <MenuItem value="misc1">Misc 1</MenuItem>
                            <MenuItem value="misc2">Misc 2</MenuItem>
                            <MenuItem value="misc3">Misc 3</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filters for Fleet Manager */}
                    <FormControl
                        sx={{ minWidth: 150 }}
                        size={isMobile ? "small" : "medium"}
                    >
                        <InputLabel id="fleet-manager-filter-label">Fleet Manager</InputLabel>
                        <Select
                            labelId="fleet-manager-filter-label"
                            id="fleet-manager-filter"
                            value={selectedFleetManager}
                            onChange={(e) => setSelectedFleetManager(e.target.value)} // Handle state here
                        >
                            <MenuItem value="manager1">Manager 1</MenuItem>
                            <MenuItem value="manager2">Manager 2</MenuItem>
                            <MenuItem value="manager3">Manager 3</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: isMobile ? "0.8rem" : "1rem",
                        }}
                        startIcon={isMobile ? null : <AddCircleOutlineIcon />}
                        onClick={handleDrawerToggle} // Open the drawer on click
                    >
                        {isMobile ? (
                            <IconButton color="inherit">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        ) : (
                            "Add New"
                        )}
                    </Button>
                </Box>

            </Box>

            {/* Drawer Component */}
            <AddEditVesselDrawer />
        </>
    );
};

export default VesselTopBar;
