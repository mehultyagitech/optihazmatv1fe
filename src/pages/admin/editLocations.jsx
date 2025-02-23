import React, { useState } from 'react';
import { DataGrid,GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import OPPageContainer from '../../components/OPPageContainer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const columns = [
    { field: 'locationName', headerName: 'Location Name', width: 250 },
    { field: 'disabled', headerName: 'Disabled', width: 250 },
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

const rows = [
    { id: 1, locationName: 'A-deck', disabled: false },
    { id: 2, locationName: 'B-deck', disabled: true },
    { id: 3, locationName: 'C-deck', disabled: false },
];

export default function EditLocations() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const theme = useTheme();

    const handleOpenDrawer = (row) => {
        setSelectedRow(row);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
    };

    const title = 'Edit Locations List';

    return (
        <OPPageContainer sx={{ px: 4, pt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {title}
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />}>
                    Add Location
                </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
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
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 300,
                        marginTop: `${theme.mixins.toolbar.minHeight}px`,
                        height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
                    },
                }}
            >
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" gutterBottom>Edit Location</Typography>
                    <Divider sx={{ my: 2 }} />
                    {selectedRow && (
                        <Box>
                            <Typography>Location Name: {selectedRow.role}</Typography>
                            <Typography>Disabled: {selectedRow.userName}</Typography>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </OPPageContainer>
    );
}
