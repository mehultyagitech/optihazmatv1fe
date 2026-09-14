import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import logout from "../../utils/logout";

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
      <CircularProgress />
      <Typography color="text.secondary">Signing you out…</Typography>
    </Box>
  );
}
