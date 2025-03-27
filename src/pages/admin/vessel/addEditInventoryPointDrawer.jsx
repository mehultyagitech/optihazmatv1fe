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
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

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
              {/* Location Information */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3 style={{ borderBottom: "1px solid green" }}>Location Information</h3>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <TextField label="Sub Location" fullWidth name="subLocation" select />
                  <TextField label="Equipment" fullWidth name="equipment" select />
                  <TextField label="Compartment" fullWidth name="compartment" select />
                  <TextField label="Object" fullWidth name="object" select />
                  <TextField label="Description" fullWidth name="description" multiline rows={2} />
                  <TextField required label="Inventory Class" fullWidth name="inventoryClass" select />
                  <FormControlLabel control={<Checkbox name="isPCHM" />} label="Is PCHM" />
                </Box>
              </Box>

              {/* Other Information */}
              <Box border={1} borderColor="green" p={2} borderRadius={2}>
                <h3 style={{ borderBottom: "1px solid green" }}>Other Information</h3>
                <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" gap={2}>
                  <TextField label="Manufacturer Brand" fullWidth name="manufacturerBrand" multiline rows={2} />
                  <TextField label="Reference No/ Drawing No" fullWidth name="referenceNo" multiline rows={2} />
                  <TextField label="Remarks" fullWidth name="remarks" multiline rows={2} />
                </Box>
              </Box>
            </Box>
          )}

{tabIndex === 1 && (
  <Box display="flex" flexDirection="column" gap={3} p={2}>
    {/* Vessel Attachments */}
    <Box border={1} borderColor="green" p={2} borderRadius={2} overflow="auto">
      <h3 style={{ color: 'green', marginBottom: '8px', borderBottom: '2px solid green', display: 'inline-block' }}>Vessel Attachments</h3>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell><b>Document Name</b></TableCell>
              <TableCell><b>Document Type</b></TableCell>
              <TableCell><b>File Name</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Delete</b></TableCell>
              <TableCell><b>Download</b></TableCell>
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
  </Box>
)}

          {tabIndex === 2 && (
          <Box display="flex" flexDirection="column" gap={2} p={2}>
          <Box 
            sx={{ 
              border: "2px solid #4CAF50", 
              borderRadius: "8px", 
              minHeight: "120px", 
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* Image upload preview or placeholder */}
          </Box>
        
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ textTransform: "none", borderRadius: "8px" }}
              startIcon={<AddIcon />}
            >
              Add Image
            </Button>
        
            <FormControlLabel 
              control={<Checkbox />} 
              label="Save Without Image"
            />
            
            <FormControlLabel 
              control={<Checkbox />} 
              label="Use Common Image"
            />
          </Box>
        </Box>
        
          )}

          {tabIndex === 3 && (

<Box display="flex" flexDirection="column" gap={2} p={2} border="1px solid #ddd" borderRadius="8px">
  {/* Select Item Button */}
  <Button 
    variant="outlined" 
    sx={{ alignSelf: "start", textTransform: "none", borderRadius: "8px" }}
  >
    Select Item
  </Button>

  {/* Table */}
  <Paper sx={{ overflow: "auto", border: "2px solid #4CAF50", borderRadius: "8px" }}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
          <TableCell sx={{ fontWeight: "bold" }}>Item Details</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Hazmats (Total Mass)</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Item Replaced</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Delete</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} align="center" sx={{ color: "#555" }}>
            No records to display
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Paper>
</Box>

          )}

          {tabIndex === 4 && (
           
           <Box 
             display="flex" 
             flexDirection="column" 
             gap={2} 
             p={2} 
             border="2px solid #4CAF50" 
             borderRadius="8px"
             width="fit-content"
           >
             {/* Header */}
             <Typography 
               variant="subtitle1" 
               sx={{ color: "#4CAF50", fontWeight: "bold", borderBottom: "1px solid #4CAF50" }}
             >
               – Inventory Remove/Replace Information
             </Typography>
           
             {/* Checkboxes */}
             <Box display="flex" alignItems="center" gap={1}>
               <FormControlLabel 
                 control={<Checkbox defaultChecked sx={{ color: "blue" }} />} 
                 label="Is Removed from IHM"
               />
               <Typography variant="body2" sx={{ color: "blue", cursor: "pointer" }}>
                 Note: Removal document is required to be attached
               </Typography>
             </Box>
             
             <FormControlLabel 
               control={<Checkbox sx={{ color: "#555" }} />} 
               label="Is Replaced"
             />
           
             {/* Date Picker */}
             <TextField 
               label="Removed Date *" 
               variant="outlined" 
               defaultValue="14-Oct-2024" 
               InputProps={{ endAdornment: <CalendarMonthIcon sx={{ color: "#555" }} /> }}
               fullWidth
             />
           
             {/* Remarks */}
             <TextField 
               label="Removed Remarks *" 
               variant="outlined" 
               multiline 
               rows={3} 
               defaultValue="Asbestos removed as per makers asbestos free declaration."
               fullWidth
             />
           </Box>
           
          )}

{tabIndex === 5 && (

<Box display="flex" flexDirection="column" gap={1} p={2} border="2px solid #4CAF50" borderRadius="8px">
  
  {/* Header Title */}
  <Typography 
    variant="subtitle1" 
    sx={{ color: "#4CAF50", fontWeight: "bold", borderBottom: "1px solid #4CAF50" }}
  >
    – Link Attachments to Inventory Point
  </Typography>

  {/* Table */}
  <Paper sx={{ overflow: "auto", borderRadius: "8px" }}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f0f8e6" }}>
          <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Document Name</TableCell>
          <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Document Type</TableCell>
          <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Down</TableCell>
          <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Link Document</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} align="center" sx={{ color: "#555" }}>
            No records to display
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Paper>

</Box>

)}

{tabIndex === 6 && (

            <Box display="flex" flexDirection="column" gap={1} p={2} border="2px solid #4CAF50" borderRadius="8px">
              
              {/* Header Title */}
              <Typography 
                variant="subtitle1" 
                sx={{ color: "#4CAF50", fontWeight: "bold", borderBottom: "1px solid #4CAF50" }}
              >
                – Link Attachments to Inventory Point
              </Typography>
            
              {/* Table */}
              <Paper sx={{ overflow: "auto", borderRadius: "8px" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f8e6" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Document Name</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Document Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Down</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Link Document</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: "#555" }}>
                        No records to display
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
