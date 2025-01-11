import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Grid } from '@mui/material';
import { PageContainer } from '@toolpad/core';
import FilterBar from './filterBar';
import { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import OPPageContainer from '../../components/OPPageContainer';

const Dashboard = () => {
    const cardData = [
        {
            title: 'Fleet Overview',
            data: [
                { label: 'Total Vessels', value: '5,276.33' },
                { label: 'Total Managers', value: '512' },
                { label: 'Total Fleet Owners', value: '120' },
            ],
        },
        {
            title: 'IHM Inventory Summary',
            data: [
                { label: 'I-1 Inventory Pts', value: '2,200' },
                { label: 'I-2 Inventory Pts', value: '1,876' },
                { label: 'I-3 Inventory Pts', value: '1,200' },
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
            data: [{ label: 'Total Registered Vessels', value: '2,396' },
            { label: 'Total Active Vessels', value: '1,876' },
            { label: 'Total Inactive Vessels', value: '300' },
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

    const handleFilterChange = (name, value) => {
        setFilters((prevFilters) =>
            prevFilters.map((filter) =>
                filter.name === name ? { ...filter, value } : filter
            )
        );
    };

    const handleSearch = () => {
        const selectedFilters = filters.reduce((acc, filter) => {
            acc[filter.name] = filter.value;
            return acc;
        }, {});
        console.log("Selected Filters:", selectedFilters);
    };

    const [filters, setFilters] = useState([
        {
            name: "client",
            value: "",
            placeholder: "Client",
            options: [
                { label: "Client 1", value: "client1" },
                { label: "Client 2", value: "client2" },
            ],
        },
        {
            name: "fleetManager",
            value: "",
            placeholder: "Fleet Manager",
            options: [
                { label: "Manager 1", value: "manager1" },
                { label: "Manager 2", value: "manager2" },
            ],
        },
        {
            name: "vessel",
            value: "",
            placeholder: "Vessel",
            options: [
                { label: "Vessel 1", value: "vessel1" },
                { label: "Vessel 2", value: "vessel2" },
            ],
        },
    ]);
    const rows = [
        { id: 1, supplierNotCooperatingDetails: 'IT Rack UPS 1 (Next Gen and NET SWAN)', emailCommunications: 'test@gmail.com', status: false },
        { id: 2, supplierNotCooperatingDetails: 'IT Rack UPS 2 (Next Gen and NET SWAN)', emailCommunications: 'test@gmail.com', status: true },
        { id: 3, supplierNotCooperatingDetails: 'Battery- Auxiliary Engine 1', emailCommunications: 'test@gmail.com', status: false },
    ];
    const columns = [
        { field: 'supplierNotCooperatingDetails', headerName: 'Supplier Not Cooperating Details', width: 400 },
        { field: 'emailCommunications', headerName: 'Email Communications', width: 280 },
        { field: 'status', headerName: 'Status', width: 200 },
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
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                    onRowClick={(params) => handleOpenDrawer(params.row)}
                />
            </Box>
        </OPPageContainer>
    );
};

export default Dashboard;
