import React from "react";
import { Toolbar, Button, Typography, Box } from "@mui/material";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const LocationPointTopBar = () => {
  return (
    <Box sx={{ padding: "5px", display: "flex", alignItems: "center", gap: "10px" }}>
      <Button  variant="contained" sx={{ textTransform: "none" }} startIcon={<AddLocationIcon />}>
        Add Inventory Point
      </Button>
      <Button  variant="contained" sx={{ textTransform: "none" }} startIcon={<OpenWithIcon />}>
        Move
      </Button>
      <Button  variant="contained" sx={{ textTransform: "none" }} startIcon={<DeleteIcon />}>
        Delete
      </Button>
      <Button  variant="contained" sx={{ textTransform: "none" }} startIcon={<ContentCopyIcon />}>
        Copy
      </Button>
      <Typography
        variant="body1"
        sx={{ marginLeft: "auto", fontWeight: "bold" }}
      >
        Total Check Points: <span style={{ color: "#00AEEF" }}>1</span>
      </Typography>
    </Box>
  );
};

export default LocationPointTopBar;
