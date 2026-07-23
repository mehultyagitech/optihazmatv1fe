import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Grid } from '@mui/material';
import FilterBar from './filterBar';
import { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import OPPageContainer from '../../components/OPPageContainer';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Dashboard = () => {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['fleetOverview'],
        queryFn: async () => {
          const response = await axiosInstance.get('/getAllDashboardData');
          return response.data.overview;
        },
        cacheTime: 0,
      });
    const cardData = [
        {
            title: 'Fleet Overview',
            data: [
              { label: 'Total Vessels', value: dashboardData?.totalVessels ?? '-' },
              { label: 'Total Managers', value: dashboardData?.totalManagers ?? '-' },
              { label: 'Total Fleet Owners', value: dashboardData?.totalFleetOwners ?? '-' },
            ],
          },
          {
            title: 'IHM Inventory Summary',
            data: [
              { label: 'I-1 Inventory Pts', value: dashboardData?.i1InventoryPts ?? '-' },
              { label: 'I-2 Inventory Pts', value: dashboardData?.i2InventoryPts ?? '-' },
              { label: 'I-3 Inventory Pts', value: dashboardData?.i3InventoryPts ?? '-' },
            ],
          },
        {
            title: 'Inventory Points',
            data: [
                { label: 'IHM Audit Inventory Pts', value: '3,456' },
                { label: 'New Inventory Pts', value: '1,200' },
                { label: 'Removed Inventory Pts', value: '456' },
            ],
        },
        {
            title: 'Vessel Overview',
            data: [{ label: 'Total Registered Vessels', value: dashboardData?.totalVessels ?? '-' },
            { label: 'Total Active Vessels', value: dashboardData?.totalVessels ?? '-' },
            { label: 'Total Inactive Vessels', value: dashboardData?.totalVessels ?? '-' },
            ],
        },
        {
            title: 'Data Submit Summary',
            data: [
                { label: 'Vessel Submitted Data', value: '2,221' },
                { label: 'Vessel Data Pending', value: '203' },
                { label: 'Last Submitted In', value: 'July, 2024' },
            ],
        },
        {
            title: 'PO Review Summary',
            data: [
                { label: 'PO Under IHM Category', value: '1,456' },
                { label: 'PO Received MD/SDOC', value: '876' },
                { label: 'PO Pending MD/SDOC', value: '300' },
            ],
        },
    ];

    const rows = [
        { id: 1, supplierNotCooperatingDetails: 'IT Rack UPS 1 (Next Gen and NET SWAN)', emailCommunications: 'test@gmail.com', status: false, client: 'ACECHEM Shipping Pte Ltd', fleetManager: 'Neptune Ship Management', vessel: 'A LA MARINE' },
        { id: 2, supplierNotCooperatingDetails: 'IT Rack UPS 2 (Next Gen and NET SWAN)', emailCommunications: 'test@gmail.com', status: true, client: 'ACECHEM Shipping Pte Ltd', fleetManager: 'Neptune Ship Management', vessel: 'A LA MARINE' },
        { id: 3, supplierNotCooperatingDetails: 'Battery- Auxiliary Engine 1', emailCommunications: 'test@gmail.com', status: false, client: 'Blue Ocean Chemicals', fleetManager: 'Anchor Marine Mgmt', vessel: 'PACIFIC NAVIGATOR' },
    ];

    const [selectedFilters, setSelectedFilters] = useState({ client: '', fleetManager: '', vessel: '' });

    const handleFilterChange = (name, value) => {
        setSelectedFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        // Filtering is applied live as selections change.
    };

    const optionsFrom = (values) =>
        [...new Set(values.filter(Boolean))]
            .sort((a, b) => String(a).localeCompare(String(b)))
            .map((v) => ({ label: v, value: v }));

    const filters = [
        { name: 'client', value: selectedFilters.client, placeholder: 'Client', options: optionsFrom(rows.map((r) => r.client)) },
        { name: 'fleetManager', value: selectedFilters.fleetManager, placeholder: 'Fleet Manager', options: optionsFrom(rows.map((r) => r.fleetManager)) },
        { name: 'vessel', value: selectedFilters.vessel, placeholder: 'Vessel', options: optionsFrom(rows.map((r) => r.vessel)) },
    ];

    const displayedRows = rows.filter(
        (r) =>
            (!selectedFilters.client || r.client === selectedFilters.client) &&
            (!selectedFilters.fleetManager || r.fleetManager === selectedFilters.fleetManager) &&
            (!selectedFilters.vessel || r.vessel === selectedFilters.vessel)
    );

    const columns = [
        { field: 'vessel', headerName: 'Vessel', width: 180 },
        { field: 'client', headerName: 'Client', width: 200 },
        { field: 'supplierNotCooperatingDetails', headerName: 'Supplier Not Cooperating Details', width: 340 },
        { field: 'emailCommunications', headerName: 'Email Communications', width: 240 },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'action',
            headerName: 'Action',
            width: 120,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => params.api.publishEvent('rowEdit', params.row)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <OPPageContainer sx={{ px: 4, pt: 2 }}>
            <FilterBar filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />
            <Divider sx={{ my: 2, mb: 4 }} />
            <Grid container spacing={3}>
                {cardData.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: index < 3 ? '0px 4px 10px rgba(37, 123, 251, 0.5)' : '0px 4px 10px rgba(165, 223, 76, 0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                borderLeft: '4px solid',
                                borderLeftColor: index < 3 ? '#257BFB' : '#A5DF4C',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: index < 3
                                        ? '0px 8px 20px rgba(37, 123, 251, 0.7)'
                                        : '0px 8px 20px rgba(165, 223, 76, 0.7)',
                                },
                            }}
                        >

                            <CardContent>
                                <Typography variant="h6" sx={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '21px', color: 'text.primary', }} component="div" gutterBottom>
                                    {card.title}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {card.data.map((item, idx) => (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={idx < card.data.length - 1 ? 2 : 0}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="600">
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Divider sx={{ my: 4, mb: 4 }} />
            <Box>
                <DataGrid
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    rows={displayedRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </Box>
        </OPPageContainer>
    );
};

export default Dashboard;
