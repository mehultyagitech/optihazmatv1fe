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
import InventoryPointTopBar from "../../../components/inventoryPointTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import DeleteIcon from "@mui/icons-material/Delete";
import AddEditInventoryPointDrawer from "./addEditInventoryPointDrawer";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import locationPointState, { locationPointAddDrawerState } from "../../../utils/States/LocationDiagram";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";

const InventoryPointCard = ({
  inventoryPointName,
  avatarSrc,
  location,
  inventoryPointNumber,
  hazmats,
  status,
  inventoryType,
  onEdit,
  onDelete,
}) => (
  <OPCard sx={{ width: "100%" }}>
    <Box display="flex" alignItems="center" gap={2}>
      <Avatar src={avatarSrc} sx={{ width: 60, height: 60 }} />
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#1976d2" }}
        >
          {inventoryPointName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inventory Point
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" ml="auto">
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          sx={{ textTransform: "none", mb: 1 }}
          onClick={() =>
            onEdit({
              avatarSrc,
              location,
              inventoryPointNumber,
              hazmats,
              status,
              inventoryType,
            })
          }
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            color: "error.main",
            borderColor: "error.main",
          }}
          onClick={() => onDelete(inventoryPointNumber)}
        >
          Delete
        </Button>
      </Box>
    </Box>
    <OPDivider />
    <Grid container spacing={2} mt={2}>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Inventory Point
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color="text.primary"
          mb={2}
        >
          {inventoryPointNumber}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Hazmats
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color="text.primary"
          mb={2}
        >
          {hazmats}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Inventory Type
        </Typography>
        <Typography fontWeight="bold" variant="body2" color="text.primary">
          {inventoryType}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Status
        </Typography>
        <Typography
          fontWeight="bold"
          variant="body2"
          color="text.primary"
          mb={2}
        >
          {status}
        </Typography>
      </Grid>
    </Grid>
  </OPCard>
);

const InventoryPoints = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawer, setDrawer] = useRecoilState(locationPointAddDrawerState);
  const vesselView = useRecoilValue(commonVesselViewState);
  const setLocationPoint = useSetRecoilState(locationPointState);

  const pinsListing = useQuery({
    queryKey: ["pinsListing", vesselView.id, page, searchQuery],
    queryFn: async () => {
      const response = await axiosInstance(`/pins/list/${vesselView?.id}`, {
        params: {
          page: page,
          search: searchQuery,
        },
      });
      return response.data;
    },
    select: (data) => data.data,
    keepPreviousData: true,
  });

  console.log("Pins Listing Data:", pinsListing.data);

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

  const filteredClients = pinsListing.isSuccess ? pinsListing.data.data : [];

  return (
    <OPPageContainer sx={{ px: 2, pt: 2 }}>
      <Box>
        <InventoryPointTopBar
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
            Inventory Points
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
              label="Inventory Points"
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
          {pinsListing.isSuccess &&
            filteredClients?.map((inventoryPoint, index) => (
              <InventoryPointCard
                key={index}
                inventoryPointName={inventoryPoint?.subLocation?.name}
                avatarSrc={
                  process.env.REACT_APP_API_URL +
                  "/uploads/" +
                  inventoryPoint?.PinImages[0]?.url
                }
                inventoryPointNumber={inventoryPoint?.inventoryPointNumber}
                location={inventoryPoint?.location}
                hazmats={inventoryPoint?.hazmats}
                inventoryType={inventoryPoint?.inventoryType}
                status={inventoryPoint.status}
                onEdit={() => {
                  setLocationPoint((prev) => ({
                    ...prev,
                    id: inventoryPoint.locationDiagram.id
                  }))

                  setDrawer({
                    open: true,
                    x: inventoryPoint.x,
                    y: inventoryPoint.y,
                    pinId: inventoryPoint.id,
                  })
                }}
                onDelete={(inventoryPointNumber) =>
                  console.log(`Delete ${inventoryPointNumber}`)
                }
              />
            ))}
        </Box>
      </Box>
      {drawer.open && <AddEditInventoryPointDrawer />}
    </OPPageContainer>
  );
};

export default InventoryPoints;
