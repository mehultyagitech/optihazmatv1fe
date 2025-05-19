import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  TextField,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import LocationDiagramTopBar from "../../../components/locationDiagramTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import { useNavigate } from "react-router-dom";

const ClientCard = ({
  id,
  avatarSrc,
  name,
  Survey,
  clientName,
  remRep,
  vesselType,
  onEdit,
}) => {
  const navigate = useNavigate();

  return (
    <OPCard sx={{ width: "100%" }}>
      <Box display="flex" alignItems="center" gap={2} onClick={() => navigate(`/vessels/inventory-points/${id}`)}>
        <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#1976d2" }}
          >
            {name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          sx={{ textTransform: "none", marginLeft: "auto" }}
          onClick={() => onEdit({ vessel, clientName, vesselType })}
        >
          Edit
        </Button>
      </Box>
      <OPDivider />
      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Survey
          </Typography>
          <Typography
            fontWeight="bold"
            variant="body2"
            color="text.primary"
            mb={2}
          >
            {Survey}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Main
          </Typography>
          <Typography
            fontWeight="bold"
            variant="body2"
            color="text.primary"
            mb={2}
          >
            {clientName}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Rem/Rep
          </Typography>
          <Typography
            fontWeight="bold"
            variant="body2"
            color="text.primary"
            mb={2}
          >
            {remRep}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Active
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
  const vessel = useRecoilValue(commonVesselViewState);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const locationDiagrams = useQuery({
    queryKey: ["locationDiagrams", page, searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/location-diagrams/${vessel.id}`,
        {
          params: {
            page: page,
            search: searchQuery,
          },
        }
      );

      return response.data;
    },
    select: (data) => {
      return data.data.locationDiagrams.map((diagram) => ({
        id: diagram.id,
        locationName: diagram.location.name,
        subLocationName: diagram.subLocation.name,
        imageId: diagram.LocationDiagramImage[0]?.id,
        imageUrl: diagram.LocationDiagramImage[0]?.url,
        userName: diagram.user.name,
        userEmail: diagram.user.email,
        clientName: diagram.vessel.clientName,
        vesselType: diagram.vessel.vesselType,
      }));
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  console.log("Location Diagrams:", locationDiagrams.data);

  const handleSearch = () => {
    const selectedFilters = filters.reduce((acc, filter) => {
      acc[filter.name] = filter.value;
      return acc;
    }, {});
    console.log("Selected Filters:", selectedFilters);
  };

  const [filters, setFilters] = useState([
    {
      name: "client",
      value: "",
      placeholder: "Client",
      options: [
        { label: "Client 1", value: "client1" },
        { label: "Client 2", value: "client2" },
      ],
    },
    {
      name: "fleetManager",
      value: "",
      placeholder: "Fleet Manager",
      options: [
        { label: "Manager 1", value: "manager1" },
        { label: "Manager 2", value: "manager2" },
      ],
    },
    {
      name: "vessel",
      value: "",
      placeholder: "Vessel",
      options: [
        { label: "Vessel 1", value: "vessel1" },
        { label: "Vessel 2", value: "vessel2" },
      ],
    },
  ]);

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.name === name ? { ...filter, value } : filter
      )
    );
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredClients = !locationDiagrams.isPending
    ? locationDiagrams.data
    : [];

  return (
    <OPPageContainer sx={{ px: 2, pt: 2 }}>
      <Box>
        <LocationDiagramTopBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
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
            Location Diagram
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
              label="Location Name"
              value={searchQuery}
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
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          }}
          gap={3}
        >
          {filteredClients.map((client, index) => (
            <ClientCard
              id={client.id}
              key={client.id}
              avatarSrc={
                process.env.REACT_APP_API_URL + "/uploads/" + client.imageUrl
              }
              Survey={"123456789"}
              name={client.locationName}
              clientName={client.clientName}
              remRep={client.userName}
              vesselType={client.vesselType}
            />
          ))}
        </Box>
      </Box>
    </OPPageContainer>
  );
};

export default Vessel;
