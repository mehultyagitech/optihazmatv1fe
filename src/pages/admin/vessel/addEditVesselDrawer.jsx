import React, { useState } from "react";
import {
  Drawer,
  Typography,
  TextField,
  Box,
  Button,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OPPageContainer from "../../../components/OPPageContainer";
import {FormControlLabel} from "@mui/material";
import OPDivider from "../../../components/OPDivider";
import { Margin } from "@mui/icons-material";

const AddEditVesselDrawer = ({ open, onClose }) => {
  const [role, setRole] = useState("manager");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  return (
    <OPPageContainer>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          sx={{
            width: isSmallScreen ? "100vw" : 400,
            padding:7,
          }}
        >
          {/* Header with Toggle */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginBottom={2}
            flexDirection={isSmallScreen ? "column" : "row"}
          >
            <Typography sx={{ fontWeight: "bold" }} marginTop={isSmallScreen ? 2 : 2} variant="h5" marginBottom={isSmallScreen ? 2 : 0}>
              Add Client/Manager
            </Typography>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label="role selection"
              size="small"
              sx={{marginLeft: isSmallScreen ? 0 : 2}}
              color="primary"
            >
              <ToggleButton value="client" aria-label="client">
                Client
              </ToggleButton>
              <ToggleButton value="manager" aria-label="manager">
                Manager
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <OPDivider />

          {/* Dynamic Fields */}
          <Box
            component="form"
            display="flex"
            flexDirection="column"
            gap={2}
            marginBottom={2}
          >
            <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
              {role === "client" ? "Client Details" : "Fleet Manager Details"}
            </Typography>
            <TextField
              required
              label="Company Name"
              variant="outlined"
              fullWidth
            />
            <TextField label="Address" variant="outlined" fullWidth />
            <TextField label="Contact Details" variant="outlined" fullWidth />
            <TextField
              required
              label="Verifavia ID"
              variant="outlined"
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={role === "client"}
                  disabled
                  color="primary"
                />
              }
              label="Is Client"
            />
          </Box>

          {/* Footer */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginTop={2}
            flexDirection={isSmallScreen ? "column" : "row"}
          >
            <Box
              display="flex"
              gap={1}
              flexDirection={isSmallScreen ? "column" : "row"}
              marginTop={isSmallScreen ? 2 : 0}
            >
              <Button variant="contained" color="primary">
                Submit
              </Button>
              <Button variant="outlined" color="secondary" onClick={onClose}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </OPPageContainer>
  );
};

export default AddEditVesselDrawer;
