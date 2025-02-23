import React, { useState } from "react";
import {
  Drawer,
  Typography,
  TextField,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";
import OPPageContainer from "../../../components/OPPageContainer";
import OPDivider from "../../../components/OPDivider";

const AddEditInventoryPointDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabIndex, setTabIndex] = useState(0);
  const [ihmClass, setIhmClass] = useState("");
  const [surveySameAsStart, setSurveySameAsStart] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [image, setImage] = useState(null);

  const tabSections = [
    "Details",
    "Hazmats",
    "Images",
    "PO Items",
    "Remove/Replace",
    "Link Attachments",
    "Add Attachments"
  ];

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <OPPageContainer>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: isSmallScreen ? "100vw" : 900, padding: isSmallScreen ? 3 : 4 }}>
          <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
            Details
          </Typography>
          {/* Tabs */}
          <Box display="flex" gap={1} mb={2} flexWrap="wrap" justifyContent="center">
            {tabSections.map((label, index) => (
              <Button
                key={index}
                variant={tabIndex === index ? "contained" : "outlined"}
                onClick={() => handleTabChange(index)}
                color="secondary"
                sx={{
                  backgroundColor: tabIndex === index ? "#EDE7F6" : "transparent",
                  color: tabIndex === index ? "#4A148C" : "#7B1FA2",
                  fontSize: isSmallScreen ? "12px" : "14px",
                  fontWeight: "",
                  padding: isSmallScreen ? "6px 10px" : "8px 14px",
                  minWidth: isSmallScreen ? "75px" : "100px",
                  borderRadius: "16px",
                  border: tabIndex === index ? "2px solid #7B1FA2" : "2px solid transparent",
                  boxShadow: tabIndex === index 
                    ? "0px 4px 8px rgba(123, 31, 162, 0.3)" 
                    : "0px 2px 4px rgba(123, 31, 162, 0.1)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": { 
                    backgroundColor: "#D1C4E9",
                    boxShadow: "0px 6px 12px rgba(123, 31, 162, 0.4)",
                    transform: "translateY(-2px)"
                  },
                }}
                
              >
                {label}
              </Button>
            ))}
          </Box>

          <OPDivider />

          {/* Vessel Details Form */}
          {tabIndex === 0 && (
            <Box display="flex" flexDirection="column" gap={3} p={3}>
              {/* Vessel Info */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3>Location Information</h3>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <TextField required label="Vessel Name" fullWidth name="vesselName" />
                  <TextField required label="IMO Number" fullWidth name="imoNumber" />
                  <TextField label="Vessel Type" fullWidth name="vesselType" />
                  <TextField label="Flag" fullWidth name="flag" />
                  <TextField label="Class Society" fullWidth name="classSociety" />
                  <TextField label="Port of Registry" fullWidth name="portOfRegistry" />
                  <TextField label="Gross Tonnage MT" fullWidth name="grossTonnageMT" />
                  <TextField label="L*B*D" fullWidth name="lbd" />
                  <TextField label="Registered Owner" fullWidth name="registeredOwner" />
                  <TextField label="Registered Owner Address" fullWidth multiline rows={2} name="registeredOwnerAddress" />
                  <TextField label="Vessel Manager" fullWidth name="vesselManager" />
                  <TextField label="Client Name" fullWidth name="clientName" />
                </Box>
              </Box>

              {/* Vessel Built Details */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3>Vessel Built Details</h3>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <TextField label="Delivery Date" type="date" InputLabelProps={{ shrink: true }} fullWidth name="deliveryDate" />
                  <TextField label="Keel Laid Date" type="date" InputLabelProps={{ shrink: true }} fullWidth name="keelLaidDate" />
                  <TextField label="Ship Yard Name" fullWidth name="shipYardName" />
                  <TextField label="Ship Yard Address" fullWidth multiline rows={2} name="shipYardAddress" />
                </Box>
              </Box>

              {/* Survey / Maintenance Details */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3>Survey / Maintenance Details</h3>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Select value={ihmClass} onChange={(e) => setIhmClass(e.target.value)} name="ihmClass" displayEmpty fullWidth>
                    <MenuItem value="" disabled>IHM Class</MenuItem>
                    <MenuItem value="Class A">Class A</MenuItem>
                    <MenuItem value="Class B">Class B</MenuItem>
                  </Select>
                  <TextField label="IHM Survey Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth name="ihmSurveyStartDate" />
                  <FormControlLabel control={<Checkbox name="ihmSurveyEndDateIsSame" checked={surveySameAsStart} onChange={(e) => setSurveySameAsStart(e.target.checked)} />} label="Survey End Dt same as Start Dt" />
                  <TextField label="IHM Survey End Date" type="date" InputLabelProps={{ shrink: true }} fullWidth disabled={surveySameAsStart} name="ihmSurveyEndDate" />
                  <TextField label="SOC Issue Date" type="date" InputLabelProps={{ shrink: true }} fullWidth name="socIssueDate" />
                  <FormControlLabel control={<Checkbox name="readyForMaintenance" />} label="Ready For Maintenance" />
                  <TextField label="Maintenance Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth name="maintenanceStartDate" />
                </Box>
              </Box>
            </Box>

          )}

{tabIndex === 1 && (
        <Box display="flex" flexDirection="column" gap={3} p={2}>
          {/* Vessel Attachments */}
          <Box border={1} borderColor="green" p={2} borderRadius={2} overflow="auto">
            <h3>Vessel Attachments</h3>
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: isSmallScreen ? "600px" : "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Document Name</b></TableCell>
                    <TableCell><b>Document Type</b></TableCell>
                    <TableCell><b>File Name</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Del</b></TableCell>
                    <TableCell><b>Down</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell>{att.name}</TableCell>
                      <TableCell>{att.type}</TableCell>
                      <TableCell>{att.filename}</TableCell>
                      <TableCell>{att.status}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="error" size="small">Delete</Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" color="primary" size="small">Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Button variant="contained" color="primary" size="small" sx={{ mt: 1 }}>+ Add</Button>
          </Box>

          {/* Vessel Image Upload */}
          <Box
            border={1} borderColor="green" p={2} borderRadius={2}
            width={isSmallScreen ? "100%" : "fit-content"}
          >
            <h3>Vessel Image</h3>
            <Box display="flex" flexDirection={isSmallScreen ? "column" : "row"} alignItems="center" gap={2}>
              <Box
                width={isSmallScreen ? "100%" : 150} height={100} border={1}
                display="flex" alignItems="center" justifyContent="center"
              >
                {image ? <img src={image} alt="Vessel" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "No Image"}
              </Box>
              <Button variant="contained" component="label" fullWidth={isSmallScreen}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Box>
          </Box>
        </Box>
      )}

          {tabIndex === 2 && (
            <Box display="flex" flexDirection="column" gap={2} p={2}>
              <Button variant="outlined" sx={{ alignSelf: "start" }}>Assign New DP</Button>
              <Paper sx={{ overflow: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>DP Info</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Effective Period</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} align="center">No records to display</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {tabIndex === 3 && (
            <Box display="flex" flexDirection="column" gap={2} p={2}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                IHM Report Fixed Text Fields
              </Typography>
              <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
                <TextField label="Header FreeText Caption (20 Chars)" fullWidth />
                <TextField label="Header FreeText Value (40 Chars)" fullWidth sx={{ mt: 2 }} />
                <TextField label="PO Data Gap FreeText Disclaimer (500 Chars)" fullWidth multiline rows={3} sx={{ mt: 2 }} />
              </Paper>

              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Common Inventory Pt Image
              </Typography>
              <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ width: 120, height: 120, border: "1px solid #000" }}></Box>
                  <Button variant="outlined">Upload Image</Button>
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Update All Inventory Pts to Use Common Image
                </Button>
              </Paper>

              <TextField
                label="Common Reference No/ Drawing No"
                required
                fullWidth
                sx={{ mt: 2 }}
              />
              <Button variant="outlined" sx={{ mt: 2 }}>
                Update Reference/Drawing No for All Inventory Pts
              </Button>
            </Box>
          )}

          {tabIndex === 4 && (
            <Box display="flex" flexDirection="column" gap={2} p={2}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Vessel Other Info
              </Typography>
              <Paper sx={{ padding: 2, border: "1px solid #008000" }}>
                <TextField label="Vessel Email ID" fullWidth name="vesselEmailId" />
              </Paper>
            </Box>
          )}



          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3} flexWrap="wrap">
            <Button variant="outlined" disabled={tabIndex === 0} onClick={() => setTabIndex(tabIndex - 1)}>
              Previous
            </Button>
            {tabIndex < tabSections.length - 1 ? (
              <Button variant="contained" onClick={() => setTabIndex(tabIndex + 1)}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary">
                Save
              </Button>
            )}
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Drawer>
    </OPPageContainer >
  );
};

export default AddEditInventoryPointDrawer;
