import React from "react";
import { Box, Button, Card, CardContent, Typography, Grid, Tabs  } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import ClientCard from "./vesselDasboardCard"; // adjust path as needed
import AddEditVesselDrawer from "./addEditVesselDrawer";
const VesselDashboard = () => {

  const [isDrawerOpen, setDrawerOpen] = React.useState(false);

  const vessel = useRecoilValue(commonVesselViewState);
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['vesselDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/getAllDashboardData/getAllVesselDashboardData/${vessel.id}`);
      

      return response.data.overview;
    },
    cacheTime: 0,
  });
  const locationDiagrams = useQuery({
    queryKey: ["locationDiagrams"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/location-diagrams/${vessel.id}`,
      );

      return response.data;
    },
    select: (data) => {
      return data.data.locationDiagrams.map((diagram) => ({
        id: diagram.id,
        locationName: diagram.location.name,
        subLocationName: diagram.subLocation.name,
        imageId: diagram.LocationDiagramImage[0]?.id,
        imageUrl: diagram.LocationDiagramImage[0]?.url,
        userName: diagram.user.name,
        userEmail: diagram.user.email,
        clientName: diagram.vessel.clientName,
        vesselType: diagram.vessel.vesselType,
      }));
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
  const filteredClients = !locationDiagrams.isPending
  ? locationDiagrams.data
  : [];

  const pieData = [
    { id: 1, value: 150, label: "Type 1", color: "#8BC34A" },
    { id: 2, value: 150, label: "Type 2", color: "#2196F3" },
    { id: 3, value: 40, label: "Type 3", color: "#BDBDBD" },
  ];

  const barData = [
    { label: "Hazmat Free Items", value: 130 },
    { label: "Prohibited Items", value: 20 },
    { label: "Not installed Hazmat Items", value: 80 },
    { label: "Installed Hazmat Items", value: 120 },
    { label: "Replaced Items", value: 9 },
  ];

  return (
    <>
    <Box p={3} sx={{ background: "#f9f9f9", minHeight: "100vh" }}>

      {/* Navigation Tabs */}
      <Box display="flex" gap={2} mb={3}>
      <Button
  startIcon={<InfoIcon />}
  variant="outlined"
  onClick={() => setDrawerOpen(true)}  // this triggers it
>
  Vessel Info
</Button>


        <Button startIcon={<AssignmentIcon />} variant="outlined">IHM Maintenance Certificate</Button>
        <Button startIcon={<FileCopyIcon />} variant="contained">IHM Report</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button startIcon={<InfoIcon />} variant="outlined" color="primary">Vessel</Button>
      </Box>

      <Grid container spacing={3}>
        {/* Pie Chart Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: "5px solid #2196F3", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>PO's Review Summary</Typography>
              <PieChart
                series={[{ data: pieData, innerRadius: 50, outerRadius: 100 }]}
                width={300}
                height={200}
              />
              <Typography variant="caption" display="block" align="right" mt={1}>
                (Click to view details)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: "5px solid #2196F3", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Items from 1 POs containing Hazmat
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: barData.map(item => item.label),
                  },
                ]}
                series={[{
                  data: barData.map(item => item.value),
                  color: "#2979FF",
                }]}
                width={400}
                height={220}
              />
              <Typography variant="caption" display="block" align="right" mt={1} color="blue">
                (Click <span style={{ color: 'blue', textDecoration: 'underline' }}>Blue colored text</span> to view item details)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Box mt={5} p={3}>
          <Typography variant="subtitle1" fontWeight="600" mb={2}>
            IHM Part 1 Summary Data (Initial IHM Part 1 + Installed Items - Replaced Items - Removed Items)
          </Typography>

          <Grid container mt={0} spacing={9}>
            {/* Card 1 */}
            <Grid item xs={12} sm={6} md={2.4} display="flex">
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "4px solid #8BC34A",
                  backgroundColor: "#fff",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 160, // ← increase height here
                  minWidth: 220
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontSize={14}>Points and Coating Systems</Typography>
                  <Typography variant="caption" color="text.secondary">i-1</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>{dashboardData?.i1InventoryPts ?? '-'} </Typography>
                </CardContent>
              </Card>
            </Grid>


            {/* Card 2 */}
            <Grid item xs={12} sm={6} md={2.4} display="flex">
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "4px solid #2196F3",
                  backgroundColor: "#fff",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 160, // ← increase height here
                  minWidth: 220
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontSize={14}>Equipment and Machinery</Typography>
                  <Typography variant="caption" color="text.secondary">i-2</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>{dashboardData?.i2InventoryPts ?? '-'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3 */}
            <Grid item xs={12} sm={6} md={2.4} display="flex">
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "4px solid #8BC34A",
                  backgroundColor: "#fff",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 160, // ← increase height here
                  minWidth: 220
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontSize={14}>Structure and Hull</Typography>
                  <Typography variant="caption" color="text.secondary">i-3</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>{dashboardData?.i3InventoryPts ?? '-'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 4 */}
            <Grid item xs={12} sm={6} md={2.4} display="flex">
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "4px solid #2196F3",
                  backgroundColor: "#fff",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 160, // ← increase height here
                  minWidth: 220
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontSize={14}>Replaced Items</Typography>
                  <Typography variant="caption" color="text.secondary">Rp</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>12</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 5 */}
            <Grid item xs={12} sm={6} md={2.4} display="flex">
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "4px solid #8BC34A",
                  backgroundColor: "#fff",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 160, // ← increase height here
                  minWidth: 220
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontSize={14}>Removed Items</Typography>
                  <Typography variant="caption" color="text.secondary">Rm</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>02</Typography>
                </CardContent>
              </Card>

            </Grid>
          </Grid>
        </Box>

<Box mt={5} p={3}>
  <Typography variant="subtitle1" fontWeight="600" mb={2}>
    Location Diagrams (Initial IHM Part 1 + Installed Items containing Hazmat)
  </Typography>
  <Grid container spacing={2}>
    {filteredClients.map((client) => (
      <Grid item key={client.id}>
        <ClientCard
          id={client.id}
          avatarSrc={
            process.env.REACT_APP_API_URL + "/uploads/" + client.imageUrl
          }
          name={client.locationName}
          survey={client.i1Count ?? 0}
          maint={client.i2Count ?? 0}
          removed={client.i3Count ?? 0}
          active={client.activeCount ?? 0}
        />
      </Grid>
    ))}
  </Grid>
</Box>


      </Grid>
    </Box>
    {isDrawerOpen && (
  <AddEditVesselDrawer
    onClose={() => setDrawerOpen(false)}
  />
)}

  </>
  
  );
  
};

export default VesselDashboard;
