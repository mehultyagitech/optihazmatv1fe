import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    TextField,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClientManagerTopBar from "../../../components/clientManagerTopBar";
import OPDivider from "../../../components/OPDivider";
import OPPageContainer from "../../../components/OPPageContainer";
import OPCard from "../../../components/OPCard";
import AddEditClientManagerDrawer from "./addEditClientManagerDrawer";
import { getAllClientManagers } from "../../../api/services/clientManager";

const ClientCard = ({ id,verifaviaId, companyName, address,contactDetails, onEdit }) => {
    // Generating a random avatar URL
    const randomAvatar = `https://avatar.iran.liara.run/public`;

    return (
        <OPCard sx={{ width: "100%" }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={randomAvatar} sx={{ width: 60, height: 60 }} />
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: "#1976d2" }}
                    >
                        {verifaviaId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vessel Client
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    sx={{ textTransform: "none", marginLeft: "auto" }}
                    onClick={() => onEdit({ id,verifaviaId, companyName, address,contactDetails })}
                >
                    Edit
                </Button>
            </Box>
            <OPDivider />
            <Box>
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.primary"
                    mb={0.5}
                >
                    Client Name
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {companyName}
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.primary"
                    mb={0.5}
                >
                    Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {address}
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.primary"
                    mb={0.5}
                >
                    Contact
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {contactDetails}
                </Typography>
            </Box>
        </OPCard>
    );
};

const VesselClientManager = () => {
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("clients");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null); // State to hold the client data being edited
  
    useEffect(() => {
      const fetchClients = async () => {
        try {
          const data = await getAllClientManagers(); // Fetch data
          setClients(data); // Update state with the fetched data
        } catch (error) {
          console.error("Error fetching client managers:", error);
        }
      };
      fetchClients();
    }, []);
  
    const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
    };
  
    const handleDrawerToggle = () => {
      setDrawerOpen(!drawerOpen);
    };
  
    const handleToggleChange = (event, newView) => {
      if (newView !== null) {
        setView(newView);
      }
    };
  
    const handleEditClick = (clientData) => {
      setClientToEdit(clientData); // Set the client data to be edited
      setDrawerOpen(true); // Open the drawer
    };
  
    const filteredClients = (clients?.data || []).filter((client) =>
        (client.companyName && client.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.verifaviaId && String(client.verifaviaId).toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
  
    return (
      <OPPageContainer>
        <Box>
        <ClientManagerTopBar recordCount={filteredClients.length} />
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
              Client/Manager
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
                label="VID or Client Name"
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
              <ToggleButtonGroup
                color="primary"
                value={view}
                exclusive
                onChange={handleToggleChange}
                size="small"
              >
                <ToggleButton value="clients">Clients</ToggleButton>
                <ToggleButton value="managers">Managers</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <OPDivider />
          <Box
            p={3}
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
            gap={3}
          >
            {filteredClients.map((client, index) => (
              <ClientCard
                key={index}
                id={client.id}
                avatarSrc={client.avatarSrc}
                verifaviaId={client.verifaviaId}
                companyName={client.companyName}
                address={client.address}
                contactDetails={client.contactDetails}
                onEdit={handleEditClick} // Pass the handleEditClick function
              />
            ))}
          </Box>
        </Box>
        <AddEditClientManagerDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          clientData={clientToEdit} // Pass the client data to the drawer
        />
      </OPPageContainer>
    );
  };
  

export default VesselClientManager;
