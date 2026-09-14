import React, { useCallback, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VesselTopBar from "../../../components/vesselTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import InfoCard from "../../../components/InfoCard";
import useVessel from "../../../api/services/useVessel";
import { useRecoilState, useRecoilValue } from "recoil";
import { ClientSelector, ManagerSelector } from "../../../utils/States/Generic";
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
        <InfoCard
            avatarSrc={avatarSrc}
            title={vessel}
            subtitle="Vessel"
            fields={[
                { label: "IMO Number", value: imoNumber },
                { label: "Client Name", value: clientName },
                { label: "Manager Name", value: managerName },
                { label: "Vessel Type", value: vesselType },
            ]}
            actions={
                <>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShopTwo />}
                        sx={{ textTransform: "none" }}
                        onClick={() => setCommonVesselViewState({ id: clientId, name: vessel })}
                    >
                        View
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={() => handleEdit()}
                    >
                        Edit
                    </Button>
                </>
            }
        />
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

    // Dropdown filters (client-side, over the loaded vessels)
    const [dropdownFilters, setDropdownFilters] = useState({
        client: "",
        manager: "",
        vesselType: "",
    });

    const handleDropdownFilterChange = (name, value) => {
        setDropdownFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Full client/manager lists from /generics, refreshed after adds/deletes.
    const allClients = useRecoilValue(ClientSelector);
    const allManagers = useRecoilValue(ManagerSelector);

    const vessels = isSuccess ? data : [];

    const uniqueSorted = (arr) =>
        [...new Set(arr.filter((v) => v && v !== "-"))].sort((a, b) =>
            String(a).localeCompare(String(b))
        );

    // Built from the client/manager lists, not just the loaded vessels, so a
    // newly added client or manager shows up before it has any vessel. Vessel
    // names are merged in so the options never go empty while those load.
    const clientOptions = useMemo(
        () =>
            uniqueSorted([
                ...allClients.map((c) => c.companyName),
                ...vessels.map((v) => v.clientName2),
            ]),
        [allClients, vessels]
    );
    const managerOptions = useMemo(
        () =>
            uniqueSorted([
                ...allManagers.map((m) => m.companyName),
                ...vessels.map((v) => v.managerName2),
            ]),
        [allManagers, vessels]
    );
    const typeOptions = useMemo(
        () => uniqueSorted(vessels.map((v) => v.vesselType)),
        [vessels]
    );

    const filteredClients = vessels.filter(
        (v) =>
            (!dropdownFilters.client || v.clientName2 === dropdownFilters.client) &&
            (!dropdownFilters.manager || v.managerName2 === dropdownFilters.manager) &&
            (!dropdownFilters.vesselType || v.vesselType === dropdownFilters.vesselType)
    );

    return (
        <OPPageContainer>
            <Box>
                <VesselTopBar
                    clientOptions={clientOptions}
                    managerOptions={managerOptions}
                    typeOptions={typeOptions}
                    filters={dropdownFilters}
                    onFilterChange={handleDropdownFilterChange}
                />
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
                    gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
                    gap={3}
                >
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            clientId={client.id}
                            avatarSrc={client.avatarSrc}
                            imoNumber={client.imoNumber}
                            vessel={client.vessel}
                            clientName={client.clientName2}  // <-- use company name
                            managerName={client.managerName2}
                            vesselType={client.vesselType}
                        />
                    ))}
                </Box>
            </Box>
        </OPPageContainer>
    );
};

export default Vessel;
