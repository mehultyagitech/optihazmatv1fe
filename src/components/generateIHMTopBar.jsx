import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Divider, Paper, TextField, Typography } from "@mui/material";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n) => String(n).padStart(2, "0");

// "04-Jul-2017"
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return `${pad2(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

// Today's date as YYYY-MM-DD for a date input.
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const roleLabel = (roles) => {
  if (!roles) return "-";
  return roles === "ADMIN" ? "IHM Maintenance Manager" : "User";
};

const Detail = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
      {value}
    </Typography>
  </Box>
);

const cardSx = {
  p: { xs: 2, md: 3 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  height: "100%",
  boxSizing: "border-box",
};

/**
 * "New report" settings and the Designated Person the report is signed by.
 * `defaultVersion` follows the vessel's reports (next version number).
 */
const GenerateIHMTopBar = ({ onGenerate = () => {}, generating = false, defaultVersion = 1 }) => {
  const [reportDate, setReportDate] = useState(todayISO());
  const [reportVersion, setReportVersion] = useState(defaultVersion);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setReportVersion(defaultVersion);
  }, [defaultVersion]);

  // Current signed-in user is the Designated Person. Shares App.jsx's
  // ["userData"] cache, so no extra request.
  const { data: user } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => (await axiosInstance.get("/users/me")).data,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.data,
  });

  const dpInitials = (user?.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const dateError = !reportDate ? "Report Period To Date is required" : "";
  const versionError = !(Number(reportVersion) > 0) ? "Enter a version above 0" : "";

  const handleGenerate = () => {
    setTouched(true);
    if (dateError || versionError) return;
    onGenerate({ version: String(reportVersion), periodToDate: reportDate });
  };

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.4fr) minmax(0, 1fr)" } }}>
      {/* New report */}
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <NoteAddOutlinedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            New IHM Report
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {"Builds the report PDF from this vessel's current inventory points, location diagrams and hazmats."}
        </Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1.4fr) minmax(0, 1fr)" } }}>
          <TextField
            type="date"
            required
            fullWidth
            label="Report Period To Date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={touched && !!dateError}
            helperText={touched && dateError ? dateError : " "}
          />
          <TextField
            type="number"
            fullWidth
            label="Report Version"
            value={reportVersion}
            onChange={(e) => setReportVersion(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            error={touched && !!versionError}
            helperText={touched && versionError ? versionError : " "}
          />
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <NoteAddOutlinedIcon />}
          disabled={generating}
          onClick={handleGenerate}
          sx={{ mt: 1, textTransform: "none", fontWeight: 700, px: 3 }}
        >
          {generating ? "Generating report..." : "Generate Report"}
        </Button>
      </Paper>

      {/* Designated Person */}
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <BadgeOutlinedIcon sx={{ color: "#00897b" }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Designated Person
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The report is signed by the signed-in user.
        </Typography>
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: "wrap" }}>
          <Box
            sx={{
              width: 130,
              height: 70,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "#fafbfd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "cursive",
              fontStyle: "italic",
              fontSize: 26,
              color: "#0d47a1",
              flexShrink: 0,
            }}
            aria-label="DP signature"
          >
            {dpInitials || "—"}
          </Box>
          <Box sx={{ display: "grid", gap: 1.5, flex: "1 1 180px" }}>
            <Detail label="DP Name" value={user?.name || "-"} />
            <Divider />
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <Detail label="DP Position" value={roleLabel(user?.roles)} />
              <Detail label="Effective From" value={formatDate(user?.createdAt)} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default GenerateIHMTopBar;
