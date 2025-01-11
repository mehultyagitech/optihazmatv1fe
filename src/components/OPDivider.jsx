import React from "react";
import { Divider } from "@mui/material";

const OPDivider = ({ sx, ...props }) => {
    return (
        <Divider
            sx={{
                my: 0, // Default margin
                marginLeft: 2, // Explicitly set no left margin
                marginRight:2,
                marginBottom: 1,
                ...sx, // Allow additional styles to be passed and merged
            }}
            {...props} // Pass additional props to the Divider component
        />
    );
};

export default OPDivider;
