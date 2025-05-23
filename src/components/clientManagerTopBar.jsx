import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddEditClientManagerDrawer from "../pages/admin/clientManager/addEditClientManagerDrawer";

const ClientManagerTopBar = ({ recordCount }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Function to toggle drawer visibility
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
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
          Records Count: {recordCount}
        </Typography>

        {/* Right Section */}
        <Box
          display="flex"
          alignItems="center"
          gap={isMobile ? 1 : 2}
          flexWrap={isMobile ? "wrap" : "nowrap"}
          justifyContent={isMobile ? "center" : "flex-end"}
        >
          <FormControlLabel
            control={<Checkbox />}
            label="Missing VID"
            sx={{ color: "#5F5F5F", fontSize: isMobile ? "0.8rem" : "1rem" }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Deleted Profile"
            sx={{ color: "#5F5F5F", fontSize: isMobile ? "0.8rem" : "1rem" }}
          />
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
      <AddEditClientManagerDrawer
        open={drawerOpen}
        onClose={handleDrawerToggle} // Close the drawer
      />
    </>
  );
};

export default ClientManagerTopBar;
