import React, { useState } from "react";
import { Grid, Typography, TextField, Button, Checkbox, FormControlLabel, Box } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';

const GenerateIHMTopBar = () => {
    const [reportDate, setReportDate] = useState("2025-02-23");
    const [reportVersion, setReportVersion] = useState(1);
    const [useSortOrder, setUseSortOrder] = useState(false);

    return (
        <Box
            sx={{
                border: "1px solid #90caf9",
                padding: 2,
                borderRadius: 2,
                width: "100%",
                maxWidth: "1200px", // Adjust for desktop
                margin: "auto",
                backgroundColor: "#fff",
            }}
        >
            <Grid container spacing={2} alignItems="center">
                {/* DP Signature */}
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" color="green">DP Signature</Typography>
                    <Box
                        sx={{
                            width: 180,
                            height: 60,
                            border: "1px solid #ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "auto",
                        }}
                    >
                        <img src="https://via.placeholder.com/150x50" alt="DP Signature" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </Box>
                </Grid>

                {/* DP Details */}
                <Grid item xs={12} sm={6}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Name</Typography>
                            <Typography variant="body1">Siddharth Ahluwalia</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Effective From Date</Typography>
                            <Typography variant="body1">04-Jul-2017</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Position</Typography>
                            <Typography variant="body1">IHM Maintenance Manager</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">Report Version</Typography>
                            <TextField
                                type="number"
                                size="small"
                                fullWidth
                                value={reportVersion}
                                onChange={(e) => setReportVersion(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} >
                            <FormControlLabel
                                control={<Checkbox checked={useSortOrder} onChange={(e) => setUseSortOrder(e.target.checked)} />}
                                label="Use Inventory Sort Order"
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Buttons & Date Picker */}
                <Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
                    <Button startIcon={<SaveIcon />} variant="outlined" fullWidth sx={{ mb: 1 }}>Save Settings</Button>
                    <Typography variant="subtitle2" color="green">Report Period To Date *</Typography>
                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        sx={{ mb: 1 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button startIcon={<DownloadIcon />} variant="contained" color="primary" fullWidth>Generate Report</Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GenerateIHMTopBar;
