import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import logout from "../../utils/logout";
import BrandMark from "../../components/brand/BrandMark";

// The sidebar's "Logout" item links here.
export default function Logout() {
  useEffect(() => {
    logout();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <BrandMark size={56} title="OptiHazmat" />
      <CircularProgress size={28} />
      <Typography color="text.secondary">Signing you out…</Typography>
    </Box>
  );
}
