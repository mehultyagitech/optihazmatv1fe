import React from "react";
import { Card } from "@mui/material";

const OPCard = ({ children, sx, index, ...props }) => {
    return (
        <Card
            elevation={3}
            sx={{
                width: 320,
                borderRadius: 2,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 20px rgba(37, 123, 251, 0.7)",
                },
                ...sx,
            }}
            {...props} // Pass additional props to the Card component
        >
            {children}
        </Card>
    );
};

export default OPCard;
