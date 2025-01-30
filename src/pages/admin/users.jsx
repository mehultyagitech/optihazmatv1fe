import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { PageContainer } from '@toolpad/core';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OPPageContainer from '../../components/OPPageContainer';

const columns = [
    { field: 'role', headerName: 'User Role', width: 200 },
    { field: 'userName', headerName: 'User Name', width: 200 },
    { field: 'loginId', headerName: 'Login Id', width: 200 },
    { field: 'clientManager', headerName: 'Client/Manager', width: 200 },
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
    {
        id: 1,
        role: 'Vessel Client',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
    {
        id: 2,
        role: 'Vessel Manager',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
    {
        id: 3,
        role: 'Vessel Client',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
    {
        id: 4,
        role: 'Vessel Manager',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
    {
        id: 5,
        role: 'Vessel Client',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
    {
        id: 6,
        role: 'Vessel Manager',
        userName: 'ACECHEM',
        loginId: 'acechemowner',
        clientManager: 'ACECHEM',
    },
];

export default function Users() {
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [loginId, setLoginId] = useState('');
    const [clientManager, setClientManager] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
    const theme = useTheme();

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleChange = (field) => (event) => {
        switch (field) {
            case 'role':
                setUserRole(event.target.value);
                break;
            case 'userName':
                setUserName(event.target.value);
                break;
            case 'loginId':
                setLoginId(event.target.value);
                break;
            case 'clientManager':
                setClientManager(event.target.value);
                break;
            default:
                break;
        }
    };

    const handleOpenDrawer = (row) => {
        setSelectedRow(row);
        setUserRole(row.role);
        setUserName(row.userName);
        setLoginId(row.loginId);
        setClientManager(row.clientManager);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
    };

    const handleSubmit = () => {
        const updatedRow = {
            id: selectedRow.id,
            role: userRole,
            userName: userName,
            loginId: loginId,
            clientManager: clientManager,
        };
        // toastr.success('User updated successfully!', 'Success', {
        //     closeButton: true,
        //     progressBar: true,
        //     timeOut: 2000, // 2 seconds
        // });

        toast.success('User updated successfully!', {
            // position: toast.POSITION.TOP_RIGHT,
            autoClose: 2000, // 2 seconds
        });

        // Simulate form submission, then open Snackbar
        // setSnackbarOpen(true);
    };

    const title = 'Users';

    return (
        <OPPageContainer sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {title}
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />}>
                    Add User
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
                    <Typography variant="h5" gutterBottom>Edit User</Typography>
                    <Divider sx={{ my: 2 }} />
                    {selectedRow && (
                        <Box>
                            <TextField
                                label="User Role"
                                value={userRole}
                                onChange={handleChange('role')}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                label="User Name"
                                value={userName}
                                onChange={handleChange('userName')}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                label="Login Id"
                                value={loginId}
                                onChange={handleChange('loginId')}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                label="Client/Manager"
                                value={clientManager}
                                onChange={handleChange('clientManager')}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ marginTop: 2 }}
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
            <ToastContainer />

            {/* Snackbar for success message */}
            <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
                    User updated successfully!
                </Alert>
            </Snackbar>
        </OPPageContainer>
    );
}
