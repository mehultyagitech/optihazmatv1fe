import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Don't forget this import

import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Button, Drawer, Box, Typography, Divider, TextField, Switch, FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OPPageContainer from '../../components/OPPageContainer';
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from '../../api/axiosInstance';

const columns = [
    { field: 'name', headerName: 'Location Name', width: 250 },
    { field: 'isDisabled', headerName: 'Disabled', width: 150, type: 'boolean' },
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

export default function EditLocations() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [formData, setFormData] = useState({ name: '', isDisabled: false });
    const theme = useTheme();

    const { data, refetch, isLoading } = useQuery({
        queryKey: ["locationData"],
        queryFn: async () => {
            const response = await axiosInstance.get("/locations");
            return response.data;
        },
        select: (res) => res.data,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });

    // Mutation for add (POST)
    const addMutation = useMutation({
        mutationFn: (newLocation) => axiosInstance.post("/locations", newLocation),
        onSuccess: () => {
            toast.success("Location added successfully!");
            refetch();
            handleCloseDrawer();
        },
        onError: (error) => {
            toast.error("Failed to add location: " + error.message);
        }
    });

    // Mutation for update (PUT)
    const updateMutation = useMutation({
        mutationFn: ({ id, ...updatedLocation }) =>
            axiosInstance.put(`/locations/${id}`, updatedLocation),
        onSuccess: () => {
            toast.success("Location updated successfully!");
            refetch();
            handleCloseDrawer();
        },
        onError: (error) => {
            toast.error("Failed to update location: " + error.message);
        }
    });

    const handleOpenDrawer = (row = null) => {
        setSelectedRow(row);
        setFormData(row || { name: '', isDisabled: false });
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
        setFormData({ name: '', isDisabled: false });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRow && selectedRow.id) {
            // Update existing location
            updateMutation.mutate({ id: selectedRow.id, ...formData });
        } else {
            // Add new location
            addMutation.mutate(formData);
        }
    };

    return (
        <OPPageContainer sx={{ px: 4, pt: 2 }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Edit Locations List</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenDrawer()}
                >
                    Add Location
                </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ height: 400 }}>
                <DataGrid
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    rows={data || []}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                    onRowClick={(params) => handleOpenDrawer(params.row)}
                    loading={isLoading}
                />
            </Box>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 400,
                        padding: 3,
                        marginTop: `${theme.mixins.toolbar.minHeight}px`,
                        height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }
                }}
            >
                <Typography variant="h5">
                    {selectedRow ? 'Edit Location' : 'Add New Location'}
                </Typography>
                <Divider />
                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <TextField
                        label="Location Name"
                        variant="outlined"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isDisabled}
                                onChange={(e) => setFormData({ ...formData, isDisabled: e.target.checked })}
                            />
                        }
                        label="Disabled"
                    />
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" color="primary" type="submit" disabled={addMutation.isLoading || updateMutation.isLoading}>
                            {selectedRow ? 'Update' : 'Add'}
                        </Button>
                        <Button onClick={handleCloseDrawer}>Cancel</Button>
                    </Box>
                </form>
            </Drawer>
        </OPPageContainer>
    );
}
