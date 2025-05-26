import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Button,
  Divider,
  Drawer,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../api/axiosInstance';
import OPPageContainer from '../../components/OPPageContainer';

export default function EditCompartmentName() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({ name: '', isDisabled: false });

  // Fetch compartment list
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['compartments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/compartments');
      return response.data.data;
    },
    cacheTime: 0,
  });

  // Add compartment
  const addMutation = useMutation({
    mutationFn: (newCompartment) => axiosInstance.post('/compartments', newCompartment),
    onSuccess: () => {
      toast.success('Compartment added successfully');
      refetch();
      handleCloseDrawer();
    },
    onError: () => {
      toast.error('Failed to add compartment');
    },
  });

  // Update compartment
  const updateMutation = useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      axiosInstance.put(`/compartments/${id}`, updatedData),
    onSuccess: () => {
      toast.success('Compartment updated successfully');
      refetch();
      handleCloseDrawer();
    },
    onError: () => {
      toast.error('Failed to update compartment');
    },
  });

  const handleOpenDrawer = (row = null) => {
    setSelectedRow(row);
    setFormData(row ? { name: row.name, isDisabled: row.isDisabled } : { name: '', isDisabled: false });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
    setFormData({ name: '', isDisabled: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRow?.id) {
      updateMutation.mutate({ id: selectedRow.id, ...formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Compartment Name', width: 250 },
    { field: 'isDisabled', headerName: 'Disabled', width: 150, type: 'boolean' },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenDrawer(params.row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <OPPageContainer sx={{ px: 4, pt: 2 }}>
      <ToastContainer />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Edit Compartment List
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => handleOpenDrawer()}
        >
          Add Compartment
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isLoading}
          checkboxSelection
          disableSelectionOnClick
          pageSize={5}
          rowsPerPageOptions={[5]}
          onRowClick={(params) => handleOpenDrawer(params.row)}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
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
            gap: 2,
          },
        }}
      >
        <Typography variant="h5">{selectedRow ? 'Edit Compartment' : 'Add New Compartment'}</Typography>
        <Divider />
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <TextField
            label="Compartment Name"
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
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={addMutation.isLoading || updateMutation.isLoading}
            >
              {selectedRow ? 'Update' : 'Add'}
            </Button>
            <Button onClick={handleCloseDrawer}>Cancel</Button>
          </Box>
        </form>
      </Drawer>
    </OPPageContainer>
  );
}
