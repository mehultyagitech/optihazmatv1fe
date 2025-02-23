import React from "react";
import { Box, Button, Card, CardContent, Typography, Grid } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

const VesselDashboard = () => {
  // Sample Data
  const pieData = [
    { id: 1, value: 40, label: "Operational" },
    { id: 2, value: 30, label: "Under Maintenance" },
    { id: 3, value: 20, label: "Docked" },
    { id: 4, value: 10, label: "Out of Service" },
  ];

  const barData = [
    { category: "Cargo", count: 25 },
    { category: "Tanker", count: 15 },
    { category: "Passenger", count: 10 },
    { category: "Fishing", count: 20 },
  ];

  return (
    <Box p={3}>
      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Button variant="contained" color="primary">
          Overview
        </Button>
        <Button variant="contained" color="secondary">
          Reports
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {["Total Vessels", "Active", "Inactive", "Maintenance"].map((title, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="h4">{Math.floor(Math.random() * 100)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Vessel Status Distribution
          </Typography>
          <PieChart
            series={[
              {
                data: pieData,
              },
            ]}
            width={400}
            height={300}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Vessel Categories
          </Typography>
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: barData.map((item) => item.category),
              },
            ]}
            series={[{ data: barData.map((item) => item.count) }]}
            width={400}
            height={300}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VesselDashboard;
