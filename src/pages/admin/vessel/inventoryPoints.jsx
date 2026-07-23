import React, { useState, useMemo } from "react";
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
import ReactPaginate from 'react-paginate';
import './../../../components/pagination.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <Avatar src={avatarSrc} sx={{ width: 60, height: 60, flexShrink: 0 }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#1976d2", wordBreak: "break-word" }}
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
          onClick={onDelete}
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
  const limit = 10;
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
          limit: limit,
        },
      });
      return response.data;
    },
    select: (data) => data.data,
    keepPreviousData: true,
  });

  const handleDelete = async (pinId) => {
    if (!window.confirm("Are you sure you want to delete this inventory point?")) {
      return;
    }
  
    try {
      await axiosInstance.delete(`/pins/${pinId}`);
      toast.success("Inventory Point deleted successfully");
  
      // Refetch the data after deletion
      pinsListing.refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete inventory point");
    }
  };
  


  // Client-side dropdown filters over the loaded inventory points.
  const [selectedFilters, setSelectedFilters] = useState({
    inventoryType: "",
    status: "",
    subLocation: "",
  });

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Filtering is applied live; the Search button also forces a refetch.
    pinsListing.refetch();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  // Raw items from API response
  const items = pinsListing.isSuccess ? pinsListing.data.data : [];

  const optionsFrom = (values) =>
    [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => ({ label: String(v), value: String(v) }));

  const filters = useMemo(
    () => [
      {
        name: "inventoryType",
        value: selectedFilters.inventoryType,
        placeholder: "Inventory Type",
        options: optionsFrom(items.map((i) => i?.inventoryType)),
      },
      {
        name: "status",
        value: selectedFilters.status,
        placeholder: "Status",
        options: optionsFrom(items.map((i) => i?.status)),
      },
      {
        name: "subLocation",
        value: selectedFilters.subLocation,
        placeholder: "Sub-Location",
        options: optionsFrom(items.map((i) => i?.subLocation?.name)),
      },
    ],
    [items, selectedFilters]
  );

  // Apply the dropdown filters client-side
  const filteredClients = items.filter(
    (i) =>
      (!selectedFilters.inventoryType ||
        String(i?.inventoryType) === selectedFilters.inventoryType) &&
      (!selectedFilters.status || String(i?.status) === selectedFilters.status) &&
      (!selectedFilters.subLocation ||
        String(i?.subLocation?.name) === selectedFilters.subLocation)
  );
  const VesselInventoryImage = pinsListing.isSuccess ? pinsListing.data.VesselInventoryImage : null;
  const meta = pinsListing.isSuccess ? pinsListing.data.meta : { page: 1, total: { pages: 1, items: 0 } };

  // ReactPaginate handler
  const handlePageClick = (event) => {
    setPage(event.selected + 1); // react-paginate is 0-based, API is 1-based
  };

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
                  !!VesselInventoryImage && VesselInventoryImage.isMain ?
                  import.meta.env.VITE_API_URL +
                  "/uploads/" + VesselInventoryImage.url :
                  import.meta.env.VITE_API_URL +
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
                onDelete={() => handleDelete(inventoryPoint.id)}

              />
            ))}
        </Box>
        {/* Pagination */}
        {meta.total.pages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={meta.total.pages}
              forcePage={meta.page - 1}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              pageClassName={"page-item"}
              previousClassName={"page-item"}
              nextClassName={"page-item"}
              breakClassName={"page-item"}
              disabledClassName={"disabled"}
            />
          </Box>
        )}
      </Box>
      {drawer.open && <AddEditInventoryPointDrawer />}
      <ToastContainer position="top-right" autoClose={2500} />
    </OPPageContainer>
  );
};

export default InventoryPoints;
