import { CircularProgress, Box } from '@mui/material';

export const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Box sx={{ mt: 2, color: "text.secondary" }}>
      Loading page...
    </Box>
  </Box>
);

export const DrawerLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={30} />
    <Box sx={{ mt: 1, color: "text.secondary", fontSize: '0.875rem' }}>
      Loading drawer...
    </Box>
  </Box>
);

export const AppLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={60} />
    <Box sx={{ mt: 2, color: "text.secondary" }}>
      Loading application...
    </Box>
  </Box>
); 