import React, { useCallback, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    TextField,
    IconButton,
    Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VesselTopBar from "../../../components/vesselTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import useVessel from "../../../api/services/useVessel";
import { useRecoilState } from "recoil";
import { searchState } from "../../../utils/States/Search";
import debounce from "lodash.debounce";
import { useSetRecoilState } from "recoil";
import { vesselState, commonVesselViewState } from "../../../utils/States/Vessel";
import { ShopTwo } from "@mui/icons-material";

const ClientCard = ({ avatarSrc, vessel, imoNumber, clientName, managerName, vesselType, clientId }) => {
    const setVesselState = useSetRecoilState(vesselState);
    const setCommonVesselViewState = useSetRecoilState(commonVesselViewState);

    const handleEdit = () => {
        setVesselState({
            id: clientId,
            open: true,
            imoNumber,
            vesselName: vessel,
            vesselType,
            clientName,
            avatarSrc,
            managerName
        });
    }

    return (
        <OPCard sx={{ width: "100%" }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: "#1976d2" }}
                    >
                        {vessel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vessel
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShopTwo />}
                        sx={{ textTransform: "none", marginLeft: "auto" }}
                        onClick={() => setCommonVesselViewState({ id: clientId, name: vessel })}
                    >
                        View
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ textTransform: "none", marginLeft: "auto" }}
                        onClick={() => handleEdit()}
                    >
                        Edit
                    </Button>
                </Box>
            </Box>
            <OPDivider />
            <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                    >
                        IMO Number
                    </Typography>
                    <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                        {imoNumber}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                    >
                        Client Name
                    </Typography>
                    <Typography fontWeight="bold"  variant="body2" color="text.primary" mb={2}>
                        {clientName}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                    >
                        Manager Name
                    </Typography>
                    <Typography fontWeight="bold" variant="body2" color="text.primary" mb={2}>
                        {managerName}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                    >
                        Vessel Type
                    </Typography>
                    <Typography fontWeight="bold" variant="body2" color="text.primary">
                        {vesselType}
                    </Typography>
                </Grid>
            </Grid>
        </OPCard>
    );
};


const Vessel = () => {
    const { getVessels } = useVessel();
    const { data, isSuccess } = getVessels();
    const [ search, setSearch ]  = useRecoilState(searchState);
    const [inputValue, setInputValue] = useState(search);

    const debouncedSetSearch = useCallback(
        debounce((value) => {
            setSearch(value);
        }, 500),
        []
    );

    const handleSearchChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        debouncedSetSearch(newValue);
    };

    const filteredClients = isSuccess ? data : [];

    return (
        <OPPageContainer>
            <Box>
                <VesselTopBar />
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    flexWrap={{ xs: "wrap", sm: "nowrap" }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        mb={{ xs: 2, sm: 0 }}
                        flexGrow={{ xs: 1, sm: 0 }}
                    >
                        Vessels
                    </Typography>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        flexWrap="wrap"
                        justifyContent={{ xs: "center", sm: "flex-end" }}
                        
                    >
                        <TextField
                            variant="outlined"
                            label="Vessel or Client Name"
                            value={inputValue}
                            onChange={handleSearchChange}
                            size="small"
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton type="button" aria-label="search" size="small">
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                    sx: { pr: 0.5 },
                                },
                            }}
                        />
                    </Box>
                </Box>
                <OPDivider />
                <Box
                    p={3}
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
                    gap={3}
                >
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            clientId={client.id}
                            avatarSrc={client.avatarSrc}
                            imoNumber={client.imoNumber}
                            vessel={client.vessel}
                            clientName={client.clientName}
                            managerName={client.managerName}
                            vesselType={client.vesselType}
                        />
                    ))}
                </Box>
            </Box>
        </OPPageContainer>
    );
};

export default Vessel;
