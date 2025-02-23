import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, Drawer, Box, Typography, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from "@mui/icons-material/Delete";
import OPPageContainer from "../../../components/OPPageContainer";
import InventoryPointTopBar  from "../../../components/inventoryPointTopBar";
import GenerateIHMTopBar  from "../../../components/generateIHMTopBar";

export default function GenerateIHM() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [tableRows, setTableRows] = useState([
        { id: 1, creationDate: '31-Jan-2025', reportPeriodToDate: '31-Dec-2024', downloadReport: 'IHM Report in PDF(v1)', replacePdfReport: 'IHM Report in PDF(v1)', approval: false, disabled: false },
        { id: 2, creationDate: '31-Jan-2025', reportPeriodToDate: '31-Dec-2024', downloadReport: 'IHM Report in PDF(v1)', replacePdfReport: 'IHM Report in PDF(v1)', approval: true, disabled: true },
        { id: 3, creationDate: '31-Jan-2025', reportPeriodToDate: '31-Dec-2024', downloadReport: 'IHM Report in PDF(v1)', replacePdfReport: 'IHM Report in PDF(v1)', approval: false, disabled: false },
    ]);
    
    const theme = useTheme();

    // Handle checkbox toggle
    const handleApprovalChange = (id) => {
        setSelectedReportId(id);
        setOpenModal(true);
    };

    // Confirm Un-Approval
    const handleConfirmUnapprove = () => {
        setTableRows(prevRows => prevRows.map(row => row.id === selectedReportId ? { ...row, approval: false } : row));
        setOpenModal(false);
    };

    // Cancel action
    const handleCancelUnapprove = () => {
        setOpenModal(false);
    };

    // Handle closing the drawer
    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
    };

    const columns = [
        { field: 'creationDate', headerName: 'Creation Date', width: 150 },
        { field: 'reportPeriodToDate', headerName: 'Report Period To Date', width: 180 },
        { field: 'downloadReport', headerName: 'Download Report', width: 180 },
        { field: 'replacePdfReport', headerName: 'Replace PDF Report', width: 180 },
        { 
            field: 'approval', 
            headerName: 'Approved', 
            width: 150,
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.approval} 
                    onChange={() => handleApprovalChange(params.row.id)}
                    color="primary"
                />
            )
        },
        { field: 'disabled', headerName: 'Disabled', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 120,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => params.api.publishEvent('rowEdit', params.row)}
                    color="error"
                    startIcon={<DeleteIcon />}
                >
                    Delete
                </Button>
            ),
        },
    ];
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

    return (
        <OPPageContainer sx={{ px: 2, pt: 2 }}>
             <InventoryPointTopBar filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Generate IHM
            </Typography>
            <GenerateIHMTopBar />
            <Divider sx={{ my: 2 }} />
            <Box>
                <DataGrid
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    rows={tableRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                />
            </Box>

            {/* Un-Approval Confirmation Modal */}
            <Dialog open={openModal} onClose={handleCancelUnapprove}>
                <DialogTitle sx={{ color: theme.palette.error.main }}>Un-Approve Report</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will hide this report from Ship and Word Report will not be available as it was deleted on approval of this Report. Are you sure to Un-Approve this Report?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelUnapprove} variant='outlined' color="primary">No</Button>
                    <Button onClick={handleConfirmUnapprove} variant='outlined' color="error" autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
        </OPPageContainer>
    );
}
