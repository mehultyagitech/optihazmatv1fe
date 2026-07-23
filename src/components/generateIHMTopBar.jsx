import React, { useState } from "react";
import { Grid, Typography, TextField, Button, Checkbox, FormControlLabel, Box } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const pad2 = (n) => String(n).padStart(2, "0");

// "04-Jul-2017"
const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return `${pad2(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

// today's date as YYYY-MM-DD for a date input
const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const roleLabel = (roles) => {
    if (!roles) return "-";
    return roles === "ADMIN" ? "IHM Maintenance Manager" : "User";
};

const GenerateIHMTopBar = ({ onGenerate = () => {}, generating = false }) => {
    const [reportDate, setReportDate] = useState(todayISO());
    const [reportVersion, setReportVersion] = useState(1);
    const [useSortOrder, setUseSortOrder] = useState(false);

    // Current logged-in user (Designated Person) from the session.
    // Shares the cache with App.jsx's ["userData"] query, so no extra fetch.
    const { data: user } = useQuery({
        queryKey: ["userData"],
        queryFn: async () => (await axiosInstance.get("/users/me")).data,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.data,
    });

    const dpName = user?.name || "-";
    const dpPosition = roleLabel(user?.roles);
    const dpEffectiveFrom = formatDate(user?.createdAt);
    const dpInitials = (user?.name || "")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

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
                            fontStyle: "italic",
                            fontFamily: "cursive",
                            fontSize: 22,
                            color: "#333",
                        }}
                    >
                        {dpInitials || "—"}
                    </Box>
                </Grid>

                {/* DP Details */}
                <Grid item xs={12} sm={6}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Name</Typography>
                            <Typography variant="body1">{dpName}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Effective From Date</Typography>
                            <Typography variant="body1">{dpEffectiveFrom}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="green">DP Position</Typography>
                            <Typography variant="body1">{dpPosition}</Typography>
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
                    <Button
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={generating}
                        onClick={() =>
                            onGenerate({ version: String(reportVersion), periodToDate: reportDate })
                        }
                    >
                        {generating ? 'Generating…' : 'Generate Report'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GenerateIHMTopBar;
