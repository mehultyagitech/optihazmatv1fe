import React from "react";
import { Box } from "@mui/material";

const OPPageContainer = ({ children, sx, ...props }) => {
    return (
        <Box
            sx={{
                width: "100%",
                margin: 0, // Ensure no default margin
                padding: 0, // Default padding (adjust as needed)
                mt: 0, // Explicitly set no top margin
                ...sx, // Merge additional styles passed via props
            }}
            {...props} // Pass additional props
        >
            {children}
        </Box>
    );
};

export default OPPageContainer;
