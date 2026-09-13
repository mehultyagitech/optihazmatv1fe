import React from "react";
import {
    Box,
    Typography,
    Button,
    useMediaQuery,
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

// Small outlined selects are 40px tall; the button is pinned to the same
// height so the whole row lines up.
const CONTROL_HEIGHT = 40;

const VesselTopBar = ({
    clientOptions = [],
    managerOptions = [],
    typeOptions = [],
    filters = { client: "", manager: "", vesselType: "" },
    onFilterChange = () => {},
}) => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const setVessel = useSetRecoilState(vesselState);
    const vesselMeta = useRecoilValue(vesselSearchMetaState);

    // Function to toggle drawer visibility
    const handleDrawerToggle = () => {
        setVessel(prev => ({ id: '', open: !prev.open}));
    };

    const filterConfigs = [
        { key: "client", id: "clients-filter", label: "Clients", allLabel: "All Clients", options: clientOptions },
        { key: "vesselType", id: "type-filter", label: "Vessel Type", allLabel: "All Types", options: typeOptions },
        { key: "manager", id: "fleet-manager-filter", label: "Fleet Manager", allLabel: "All Managers", options: managerOptions },
    ];

    return (
        <>
            {/* Top Bar */}
            {/* Top-aligned so the count stays level with the first row of
                controls when a narrow screen wraps the filters */}
            <Box
                display="flex"
                alignItems={isMobile ? "stretch" : "flex-start"}
                justifyContent="space-between"
                px={2}
                py={1.5}
                flexDirection={isMobile ? "column" : "row"}
                gap={2}
            >
                {/* Left Section */}
                <Typography
                    variant="body1"
                    display="flex"
                    alignItems="center"
                    sx={{
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        minHeight: CONTROL_HEIGHT,
                    }}
                >
                    <ContactPageIcon sx={{ mr: 1 }} />
                    Records Count: {vesselMeta?.total || 0}
                </Typography>

                {/* Right Section */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    flexWrap="wrap"
                    justifyContent={isMobile ? "stretch" : "flex-end"}
                    width={isMobile ? "100%" : "auto"}
                >
                    {filterConfigs.map(({ key, id, label, allLabel, options }) => (
                        <FormControl
                            key={key}
                            size="small"
                            sx={{
                                width: isMobile ? "100%" : 170,
                            }}
                        >
                            <InputLabel id={`${id}-label`}>{label}</InputLabel>
                            <Select
                                labelId={`${id}-label`}
                                id={id}
                                label={label}
                                value={filters[key]}
                                onChange={(e) => onFilterChange(key, e.target.value)}
                            >
                                <MenuItem value="">{allLabel}</MenuItem>
                                {options.map((opt) => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ))}

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleDrawerToggle} // Open the drawer on click
                        sx={{
                            height: CONTROL_HEIGHT,
                            px: 2.5,
                            whiteSpace: "nowrap",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        Add New
                    </Button>
                </Box>
            </Box>

            {/* Drawer Component */}
            <AddEditVesselDrawer />
        </>
    );
};

export default VesselTopBar;
