import React from "react";
import { Card } from "@mui/material";

const OPCard = ({ children, sx, ...props }) => {
    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: 300,
                boxShadow: 3,
                borderRadius: "8px",
                overflow: "hidden",
                mb: 2,
                ...sx, // Allow additional styles to be passed and merged
            }}
            {...props} // Pass additional props to the Card component
        >
            {children}
        </Card>
    );
};

export default OPCard;
