import React, { useState, useMemo, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // "Save Area" redirects here and passes its confirmation along, since the
  // crop page is gone by the time the toast would render.
  const routerLocation = useLocation();
  const pageNavigate = useNavigate();
  const flash = routerLocation.state?.flash;

  useEffect(() => {
    if (!flash) return;
    toast.success(flash);
    // Drop it from history so a refresh or Back does not replay the message.
    pageNavigate(routerLocation.pathname, { replace: true, state: null });
  }, [flash, pageNavigate, routerLocation.pathname]);

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

  // Client-side dropdown filters over the loaded location diagrams.
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    subLocation: "",
    vesselType: "",
  });

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    locationDiagrams.refetch();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const items = !locationDiagrams.isPending ? locationDiagrams.data ?? [] : [];

  const optionsFrom = (values) =>
    [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => ({ label: String(v), value: String(v) }));

  const filters = useMemo(
    () => [
      {
        name: "location",
        value: selectedFilters.location,
        placeholder: "Location",
        options: optionsFrom(items.map((i) => i?.locationName)),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Sub-Location",
        options: optionsFrom(items.map((i) => i?.subLocationName)),
      },
      {
        name: "vesselType",
        value: selectedFilters.vesselType,
        placeholder: "Vessel Type",
        options: optionsFrom(items.map((i) => i?.vesselType)),
      },
    ],
    [items, selectedFilters]
  );

  const filteredClients = items.filter(
    (i) =>
      (!selectedFilters.location || i?.locationName === selectedFilters.location) &&
      (!selectedFilters.subLocation ||
        i?.subLocationName === selectedFilters.subLocation) &&
      (!selectedFilters.vesselType || i?.vesselType === selectedFilters.vesselType)
  );

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
                import.meta.env.VITE_API_URL + "/uploads/" + client.imageUrl
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
      <ToastContainer position="top-right" autoClose={3000} />
    </OPPageContainer>
  );
};

export default Vessel;
