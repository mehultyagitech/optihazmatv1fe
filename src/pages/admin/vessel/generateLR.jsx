import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import OPPageContainer from "../../../components/OPPageContainer";
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from "@mui/icons-material/Delete";

const columns = [
    { field: 'lrReport', headerName: 'LR Reports', width: 200 },
    { field: 'reportDownload', headerName: 'Report Download', width: 200 },
    {
        field: 'approval',
        headerName: 'Approved',
        width: 200,
        renderCell: (params) => (
            <Checkbox
                checked={params.row.approval}
                onChange={() => handleApprovalChange(params.row.id)}
                color="primary"
            />
        )
    },
    {
        field: 'action',
        headerName: 'Action',
        width: 200,
        renderCell: (params) => (
            <Button
                variant="outlined"
                size="small"
                onClick={() => params.api.publishEvent('rowEdit', params.row)}
                startIcon={<DeleteIcon />}
                color="error"
            >
                Delete
            </Button>
        ),
    },
];

const rows = [
    { id: 1, compartmentName: 'IT Rack UPS 1 (Next Gen and NET SWAN)', disabled: false },
    { id: 2, compartmentName: 'IT Rack UPS 2 (Next Gen and NET SWAN)', disabled: true },
    { id: 3, compartmentName: 'Battery- Auxiliary Engine 1', disabled: false },
];

export default function GenerateLR() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const theme = useTheme();

    const title = 'Generate LR Report';

    return (
        <OPPageContainer sx={{ px: 2, pt: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {title}
            </Typography>
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
                />
            </Box>
        </OPPageContainer>
    );
}
