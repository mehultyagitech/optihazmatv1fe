import React from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ClientManagerTopBar from "../../components/clientManagerTopBar";
import OPCard from "../../components/OPCard";
import OPDivider from "../../components/OPDivider";
import OPPageContainer from "../../components/OPPageContainer";

const ClientCard = ({ avatarSrc, vid, clientName, address }) => (
    <OPCard>
        <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar src={avatarSrc} sx={{ width: 50, height: 50 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {vid}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vessel Client
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" fontWeight="bold">
                Client Name
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
                {clientName}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
                Address
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {address}
            </Typography>
        </CardContent>
        <CardActions>
            <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform: "none" }}
            >
                Edit
            </Button>
        </CardActions>
    </OPCard>
);

const VesselClientManager = () => {
    const clients = [
        {
            avatarSrc: "https://via.placeholder.com/50",
            vid: "VID: 412",
            clientName: "ACECHEM",
            address: "Guzin Sokak 9/1, Aydintepe Mah, Tuzla, 34947 Island, Turkey.",
        },
        {
            avatarSrc: "https://via.placeholder.com/50",
            vid: "VID: 412",
            clientName: "ACECHEM",
            address: "Guzin Sokak 9/1, Aydintepe Mah, Tuzla, 34947 Island, Turkey.",
        }
        // Duplicate the above object to simulate more cards
    ];

    return (
        <OPPageContainer>
                    <Box >
            <ClientManagerTopBar />
            <Typography p={3} variant="h4" fontWeight="bold">
                Client/Manager
            </Typography>
            <OPDivider />
            <Box p={3} display="flex" flexWrap="wrap" gap={2}>
                {clients.map((client, index) => (
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
