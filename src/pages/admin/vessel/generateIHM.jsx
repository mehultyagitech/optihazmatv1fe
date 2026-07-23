import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, Box, Typography, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from "@mui/icons-material/Delete";
import GetAppIcon from '@mui/icons-material/GetApp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OPPageContainer from "../../../components/OPPageContainer";
import GenerateIHMTopBar from "../../../components/generateIHMTopBar";
import OPDivider from '../../../components/OPDivider';
import { useRecoilValue } from "recoil";
import { commonVesselViewState } from "../../../utils/States/Vessel";
import {
    getIHMReports,
    generateIHMReport,
    updateIHMReport,
    deleteIHMReport,
} from "../../../api/services/ihmReport";

const fmt = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function GenerateIHM() {
    const theme = useTheme();
    const vessel = useRecoilValue(commonVesselViewState);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);

    const loadReports = useCallback(async () => {
        if (!vessel?.id) {
            setReports([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getIHMReports(vessel.id);
            const list = (res?.data?.reports ?? []).map((r) => ({
                id: r.id,
                creationDate: fmt(r.createdAt),
                reportPeriodToDate: fmt(r.periodToDate),
                ihmReportNumber: r.ihmReportNumber || '-',
                downloadReport: `IHM Report PDF (v${r.version})`,
                fileUrl: r.fileUrl,
                fileName: r.fileName,
                approval: r.approved,
                disabled: r.disabled ? 'Yes' : 'No',
            }));
            setReports(list);
        } catch (err) {
            toast.error(err?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    }, [vessel?.id]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleGenerate = async ({ version, periodToDate }) => {
        if (!vessel?.id) {
            toast.error('Select a vessel first (open a vessel and click View).');
            return;
        }
        setGenerating(true);
        try {
            await generateIHMReport(vessel.id, { version, periodToDate });
            toast.success('IHM Report generated');
            await loadReports();
        } catch (err) {
            toast.error(err?.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = (row) => {
        if (!row.fileUrl) return;
        window.open(`${import.meta.env.VITE_API_URL}/uploads/${row.fileUrl}`, '_blank');
    };

    const handleApprovalChange = async (row) => {
        if (row.approval) {
            // Un-approving needs confirmation
            setSelectedReportId(row.id);
            setOpenModal(true);
            return;
        }
        try {
            await updateIHMReport(row.id, { approved: true });
            await loadReports();
        } catch (err) {
            toast.error(err?.message || 'Failed to update report');
        }
    };

    const handleConfirmUnapprove = async () => {
        try {
            await updateIHMReport(selectedReportId, { approved: false });
            toast.success('Report un-approved');
            await loadReports();
        } catch (err) {
            toast.error(err?.message || 'Failed to update report');
        } finally {
            setOpenModal(false);
            setSelectedReportId(null);
        }
    };

    const handleCancelUnapprove = () => {
        setOpenModal(false);
        setSelectedReportId(null);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Delete this IHM report?')) return;
        try {
            await deleteIHMReport(row.id);
            toast.success('Report deleted');
            await loadReports();
        } catch (err) {
            toast.error(err?.message || 'Failed to delete report');
        }
    };

    const columns = [
        { field: 'creationDate', headerName: 'Creation Date', flex: 1, minWidth: 120 },
        { field: 'reportPeriodToDate', headerName: 'Report Period To Date', flex: 1.2, minWidth: 150 },
        { field: 'ihmReportNumber', headerName: 'Report No', flex: 1, minWidth: 120 },
        {
            field: 'downloadReport',
            headerName: 'Download Report',
            flex: 1.6,
            minWidth: 200,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<GetAppIcon />}
                    onClick={() => handleDownload(params.row)}
                >
                    {params.value}
                </Button>
            ),
        },
        {
            field: 'approval',
            headerName: 'Approved',
            flex: 0.7,
            minWidth: 100,
            sortable: false,
            renderCell: (params) => (
                <Checkbox
                    checked={!!params.row.approval}
                    onChange={() => handleApprovalChange(params.row)}
                    color="primary"
                />
            )
        },
        { field: 'disabled', headerName: 'Disabled', flex: 0.6, minWidth: 90 },
        {
            field: 'action',
            headerName: 'Action',
            flex: 0.8,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDelete(params.row)}
                    color="error"
                    startIcon={<DeleteIcon />}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <OPPageContainer sx={{ px: 2, pt: 2 }}>
            <Typography variant='h5' component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Generate IHM{vessel?.name ? ` : ${vessel.name}` : ""}
            </Typography>
            <OPDivider sx={{ my: 2, mx: 2 }} />
            <GenerateIHMTopBar onGenerate={handleGenerate} generating={generating} />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    autoHeight
                    loading={loading}
                    sx={{ width: '100%' }}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    rows={reports}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    checkboxSelection
                    disableRowSelectionOnClick
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
            <ToastContainer position="top-right" autoClose={2500} />
        </OPPageContainer>
    );
}
