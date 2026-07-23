import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OPPageContainer from '../../components/OPPageContainer';
import { getAllUsers, createUser, updateUser } from '../../api/services/userService';

const DEFAULT_PASSWORD = 'admin123';

const emptyForm = {
    id: null,
    name: '',
    email: '',
    roles: 'USER',
    disabled: false,
};

export default function Users() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState('add'); // 'add' | 'edit'
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const columns = [
        {
            field: 'roles',
            headerName: 'User Role',
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'ADMIN' ? 'Admin' : 'User'}
                    color={params.value === 'ADMIN' ? 'primary' : 'default'}
                    size="small"
                />
            ),
        },
        { field: 'name', headerName: 'User Name', width: 220 },
        { field: 'email', headerName: 'Login Id', width: 260 },
        {
            field: 'disabled',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Disabled' : 'Active'}
                    color={params.value ? 'error' : 'success'}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(params.row);
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ];

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            const list = res?.data?.users ?? [];
            setRows(list);
        } catch (error) {
            toast.error(error?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenAdd = () => {
        setMode('add');
        setForm(emptyForm);
        setDrawerOpen(true);
    };

    const handleOpenEdit = (row) => {
        setMode('edit');
        setForm({
            id: row.id,
            name: row.name || '',
            email: row.email || '',
            roles: row.roles || 'USER',
            disabled: !!row.disabled,
        });
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const handleChange = (field) => (event) => {
        const value = field === 'disabled' ? event.target.checked : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error('Name and Login Id (email) are required');
            return;
        }
        setSaving(true);
        try {
            if (mode === 'add') {
                await createUser({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    roles: form.roles,
                });
                toast.success(`User created. Initial password: ${DEFAULT_PASSWORD}`, {
                    autoClose: 4000,
                });
            } else {
                await updateUser(form.id, {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    roles: form.roles,
                    disabled: form.disabled,
                });
                toast.success('User updated successfully!', { autoClose: 2000 });
            }
            setDrawerOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <OPPageContainer sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Users
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenAdd}
                >
                    Add User
                </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={loading}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick
                    onRowClick={(params) => handleOpenEdit(params.row)}
                />
            </Box>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 340,
                        marginTop: `${theme.mixins.toolbar.minHeight}px`,
                        height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
                    },
                }}
            >
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        {mode === 'add' ? 'Add User' : 'Edit User'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                        label="User Name"
                        value={form.name}
                        onChange={handleChange('name')}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Login Id (email)"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        select
                        label="User Role"
                        value={form.roles}
                        onChange={handleChange('roles')}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    >
                        <MenuItem value="USER">User</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                    </TextField>

                    {mode === 'add' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Initial password will be <strong>{DEFAULT_PASSWORD}</strong>. The user
                            can change it after logging in.
                        </Typography>
                    ) : (
                        <FormControlLabel
                            sx={{ mt: 1 }}
                            control={
                                <Switch
                                    checked={!form.disabled}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, disabled: !e.target.checked }))
                                    }
                                />
                            }
                            label={form.disabled ? 'Disabled' : 'Active'}
                        />
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 3 }}
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : mode === 'add' ? 'Create User' : 'Save Changes'}
                    </Button>
                </Box>
            </Drawer>
            <ToastContainer />
        </OPPageContainer>
    );
}
