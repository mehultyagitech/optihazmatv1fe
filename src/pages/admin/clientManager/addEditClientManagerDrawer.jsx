import React, { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  TextField,
  Box,
  Button,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OPPageContainer from "../../../components/OPPageContainer";
import { FormControlLabel } from "@mui/material";
import OPDivider from "../../../components/OPDivider";
import { createClientManagers, updateClientManager } from "../../../api/services/clientManager";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEditClientManagerDrawer = ({ open, onClose, clientData }) => {
  console.log("clientData:", clientData);

  const [role, setRole] = useState("manager");
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    contactDetails: "",
    verifaviaId: "",
    isClient: false,
  });
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [errors, setErrors] = useState({});

  // Use clientData to pre-fill the form when editing
  useEffect(() => {
    if (clientData) {
      setFormData({
        id: clientData.id || "",
        companyName: clientData.companyName || "",
        address: clientData.address || "",
        contactDetails: clientData.contactDetails || "",
        verifaviaId: clientData.verifaviaId || "",
        isClient: clientData.isClient || false,
      });
      setRole(clientData.isClient ? "client" : "manager");
    }
  }, [clientData]);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
      setFormData(prevData => ({
        ...prevData,
        isClient: newRole === "client"
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.contactDetails) newErrors.contactDetails = "Contact Details are required";
    if (!formData.verifaviaId) newErrors.verifaviaId = "Verifavia ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all mandatory fields.");
      return;
    }
    setLoading(true);
    try {
      let response;
      if (clientData && clientData.id) {
        console.log("clientData.id:", clientData.id);
        // Update existing client manager
        response = await updateClientManager(clientData.id, formData);
        if(clientData.isClient==true){
          toast.success("Client Updated Successfully!");
        }else{
          toast.success("Manager Updated Successfully!");
        }
      } else {
        response = await createClientManagers(formData);
        toast.success("New Manager Created Successfully!");
      }

      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OPPageContainer>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: isSmallScreen ? "100vw" : 800, padding: 9 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={2}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {clientData ? "Edit Client/Manager" : "Add Client/Manager"}
            </Typography>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label="role selection"
              size="small"
              sx={{ marginLeft: isSmallScreen ? 0 : 2 }}
              color="primary"
            >
              <ToggleButton value="client" aria-label="client">
                Client
              </ToggleButton>
              <ToggleButton value="manager" aria-label="manager">
                Manager
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <OPDivider />

          {/* Dynamic Fields */}
          <Box
            component="form"
            display="flex"
            flexDirection="column"
            gap={2}
            marginBottom={2}
          >
            <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
              {role === "client" ? "Client Details" : "Fleet Manager Details"}
            </Typography>
            <TextField
              required
              label="Company Name"
              variant="outlined"
              fullWidth
              name="companyName"
              value={formData.companyName}
              error={!!errors.companyName}
              helperText={errors.companyName}
              onChange={handleInputChange}
            />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={!!errors.address}
              helperText={errors.address}
            />
            <TextField
              label="Contact Details"
              variant="outlined"
              fullWidth
              name="contactDetails"
              value={formData.contactDetails}
              onChange={handleInputChange}
              error={!!errors.contactDetails}
              helperText={errors.contactDetails}
            />
            <TextField
              required
              label="Verifavia ID"
              variant="outlined"
              fullWidth
              error={!!errors.verifaviaId}
              helperText={errors.verifaviaId}
              name="verifaviaId"
              value={formData.verifaviaId}
              onChange={handleInputChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={role === "client"}
                  disabled
                  color="primary"
                />
              }
              label="Is Client"
            />
          </Box>

          {/* Footer */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {clientData ? "Update" : "Submit"}
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
      <ToastContainer />
    </OPPageContainer>
  );
};


export default AddEditClientManagerDrawer;
