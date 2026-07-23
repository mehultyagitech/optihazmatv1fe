import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OPPageContainer from '../../components/OPPageContainer';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from 'xlsx';
import { getPurchaseOrders, uploadPurchaseOrders, mapPosToGrid } from '../../api/services/poService';
import {
  Dialog,
  DialogTitle,
  DialogContent,Menu, MenuItem
} from '@mui/material';

const columns = [
  { field: 'id', headerName: 'Id', width: 120 },
  { field: 'clientName', headerName: 'Client Name', width: 200 },
  { field: 'shipName', headerName: 'Ship Name', width: 200 },
  {
    field: 'po',
    headerName: 'PO',
    width: 200,
    renderCell: (params) => (
      <Button
        variant="text"
        sx={{ color: 'blue', textDecoration: 'underline' }}
        onClick={() => handleOpenDialog(params.row)}
      >
        {params.value}
      </Button>
    ),
  },
  
  { field: 'supplierName', headerName: 'Supplier Name', width: 200 },
  { field: 'vdrive', headerName: 'VDrive', width: 150 },
  { field: 'docStatus', headerName: 'Doc Status', width: 200 },
  { field: 'isHazmat', headerName: 'IsHazmat', width: 200 },
  { field: 'isHazmatExpected', headerName: 'IsHazmatExpected', width: 200 },
  { field: 'poRcvdate', headerName: 'Po Rcvdate', width: 200 },
  { field: 'uploadDate', headerName: 'Uploaddate', width: 200 },
  { field: 'docRcvdDate', headerName: 'Doc Rcvd Date', width: 200 },
  { field: 'refNo', headerName: 'Ref No', width: 200 },
  { field: 'shipImo', headerName: 'Ship Imo', width: 200 },
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

const productColumns = [
  { field: 'supplierName', headerName: 'Supplier Name', width: 200 },
  { field: 'brandName', headerName: 'Brand Name', width: 150 },
  { field: 'hazMat', headerName: 'HazMat', width: 120 },
  { field: 'hazMatMass', headerName: 'HazMat Mass', width: 150 },
  { field: 'isOfflanded', headerName: 'IsOfflanded', width: 150 },
  { field: 'isInstalled', headerName: 'IsInstalled', width: 150 },
  { field: 'installedQty', headerName: 'Installed Qty', width: 150 },
  { field: 'replacedQty', headerName: 'Replaced Qty', width: 150 },
  { field: 'removedQty', headerName: 'Removed Qty', width: 150 },
  { field: 'productDesc', headerName: 'Product Desc', width: 200 },
];


export default function AllPoItems() {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const apiRef = useGridApiRef();

  const [rows, setRows] = useState([]);
  const [itemsByPo, setItemsByPo] = useState({});
  const [loading, setLoading] = useState(false);

  // Load persisted purchase orders from the backend.
  const loadPurchaseOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrders();
      const { rows: mappedRows, itemsByPo: mappedItems } = mapPosToGrid(
        res?.data?.purchaseOrders ?? []
      );
      setRows(mappedRows);
      setItemsByPo(mappedItems);
    } catch (err) {
      toast.error(err?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  // Download the blank PO Excel template (the sample format).
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/PO_data_Sample_Format_IHM_MTC.xlsx';
    link.download = 'PO data Sample_Format(IHM_MTC).xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse an uploaded PO Excel (matching the sample format) and persist it.
  const handleUploadExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Normalise header keys so parenthetical notes / spacing don't matter
        const norm = (s) =>
          String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '');

        const uploadRows = json
          .map((raw) => {
            const r = {};
            Object.keys(raw).forEach((k) => {
              r[norm(k)] = raw[k];
            });
            return {
              poNumber: String(r.ponumber || r.po || ''),
              shipName: String(r.shipname || ''),
              shipImo: String(r.shipimo || ''),
              clientName: String(r.clientname || r.client || ''),
              supplier: String(r.supplier || r.suppliername || ''),
              supplierEmail1: String(r.supplieremail1 || ''),
              supplierEmail2: String(r.supplieremail2 || ''),
              supplierEmail3: String(r.supplieremail3 || ''),
              supplierPhone1: String(r.supplierphone1 || ''),
              supplierPhone2: String(r.supplierphone2 || ''),
              orderDate: String(r.orderdate || ''),
              orderRcvDate: String(r.orderrcvdate || r.orderdate || ''),
              referenceNumber: String(r.referencenumber || ''),
              emailType: String(r.emailtype || ''),
              currencyCode: String(r.currencycode || ''),
              // item / product level fields
              product: String(r.product || ''),
              brand: String(r.brand || ''),
              partDescription: String(r.partdescription || ''),
              partExecution: String(r.partexecution || ''),
              qtyRcv: String(r.qtyrcv || r.qty || ''),
              unit: String(r.unit || ''),
              remarks: String(r.remarks || ''),
              itemDiscountPer: String(r.itemdiscountper || ''),
              priceUnit: String(r.priceunit || ''),
              canContainHazmat: String(r.cancontainhazmat || 'NO'),
            };
          })
          .filter((it) => it.shipName || it.poNumber || it.supplier);

        if (uploadRows.length === 0) {
          toast.error('No PO data rows found in the Excel file');
          return;
        }

        const result = await uploadPurchaseOrders(uploadRows);
        await loadPurchaseOrders();
        const { poCreated = 0, itemCreated = uploadRows.length } =
          result?.data || {};
        toast.success(`Imported ${itemCreated} item(s) across ${poCreated} PO(s)`);
      } catch (err) {
        console.error('Excel upload error:', err);
        toast.error(
          err?.message || 'Failed to import the Excel file. Please use the sample format.'
        );
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Real counts derived from the data (rows are PO-level)
  const poCount = rows.length;
  const itemCount = rows.reduce((n, r) => n + (r.itemCount || 1), 0);
  const hazmatCount = rows.filter((r) => r.isHazmat && r.isHazmat !== 'not-containing').length;
  const expectedCount = rows.filter((r) => String(r.isHazmatExpected).toUpperCase() === 'YES').length;
  const docReceivedCount = rows.filter((r) => r.docStatus && r.docStatus !== 'not_started').length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (status) => {
    setAnchorEl(null);
    if (status) {
      console.log("Selected status:", status);
      // 👉 you can also update state or call API here
    }
  };

  
const columns = [
  { field: 'id', headerName: 'Id', width: 120 },
  { field: 'clientName', headerName: 'Client Name', width: 200 },
  { field: 'shipName', headerName: 'Ship Name', width: 200 },
  {
    field: 'po',
    headerName: 'PO',
    width: 200,
    renderCell: (params) => (
      <Button
        variant="text"
        sx={{ color: 'blue', textDecoration: 'underline' }}
        onClick={() => handleOpenDialog(params.row)}
      >
        {params.value}
      </Button>
    ),
  },
  
  { field: 'itemCount', headerName: 'Items', width: 90 },
  { field: 'supplierName', headerName: 'Supplier Name', width: 200 },
  { field: 'vdrive', headerName: 'VDrive', width: 150 },
  { field: 'docStatus', headerName: 'Doc Status', width: 200 },
  { field: 'isHazmat', headerName: 'IsHazmat', width: 200 },
  { field: 'isHazmatExpected', headerName: 'IsHazmatExpected', width: 200 },
  { field: 'poRcvdate', headerName: 'Po Rcvdate', width: 200 },
  { field: 'uploadDate', headerName: 'Uploaddate', width: 200 },
  { field: 'docRcvdDate', headerName: 'Doc Rcvd Date', width: 200 },
  { field: 'refNo', headerName: 'Ref No', width: 200 },
  { field: 'shipImo', headerName: 'Ship Imo', width: 200 },
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
  const [openDialog, setOpenDialog] = useState(false);
const [selectedPo, setSelectedPo] = useState(null);

const handleOpenDialog = (row) => {
  setSelectedPo(row.po);
  setOpenDialog(true);
};

  const title = 'All PO Items';

  return (
    <OPPageContainer sx={{ p: 2 }}>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="lg">
  <DialogTitle>
    Product List (PO: {selectedPo}) — {(itemsByPo[selectedPo] || []).length} item(s)
  </DialogTitle>
  <DialogContent>
    <Box sx={{ height: 400 }}>
      <DataGrid
        rows={itemsByPo[selectedPo] || []}
        columns={productColumns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>

    {/* Footer inside dialog */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 2,
        p: 1,
        bgcolor: '#f5f5f5',
        borderTop: '1px solid #ddd',
      }}
    >
      <Button variant="contained" size="small" color="error">Remove</Button>
      <Button variant="contained" size="small" color="info">Hazmat</Button>
      <Button variant="contained" size="small" color="warning">Is-OffLanded</Button>
      <Button variant="contained" size="small" color="success">Is-Installed</Button>
      <Button variant="contained" size="small" sx={{ bgcolor: 'green', color: 'white' }}>
        Upload Document (Green)
      </Button>
    </Box>
  </DialogContent>
</Dialog>

      {/* Top Title Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* ✅ New Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          bgcolor: 'white',
          borderBottom: '1px solid #ddd',
          mb: 2,
        }}
      >
        {/* Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            color="default"
            title="Open filters"
            onClick={() => apiRef.current?.showFilterPanel()}
          >
            <FilterListIcon />
          </IconButton>
          <Typography variant="body2" fontWeight="bold">PO-</Typography>
          <Box sx={{ bgcolor: 'red', color: 'white', px: 1, borderRadius: 1 }}>{poCount}</Box>
          <Typography variant="body2" fontWeight="bold">Item-</Typography>
          <Box sx={{ bgcolor: 'grey', color: 'white', px: 1, borderRadius: 1 }}>{itemCount}</Box>
          <Box sx={{ bgcolor: 'orange', color: 'white', px: 1, borderRadius: 1 }}>{hazmatCount}</Box>
          <Box sx={{ bgcolor: 'blue', color: 'white', px: 1, borderRadius: 1 }}>{expectedCount}</Box>
          <Box sx={{ bgcolor: 'green', color: 'white', px: 1, borderRadius: 1 }}>{docReceivedCount}</Box>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            sx={{ bgcolor: 'teal', color: 'white', '&:hover': { bgcolor: 'darkgreen' } }}
          >
            OTD
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Download Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<UploadFileIcon />}
            component="label"
          >
            Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              hidden
              onChange={handleUploadExcel}
            />
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box >
        <DataGrid
          apiRef={apiRef}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>{/* ✅ Footer buttons here */}
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mt: 2,
    p: 1,
    bgcolor: '#f5f5f5',
    borderTop: '1px solid #ddd',
  }}
>
<Button
        variant="contained"
        size="small"
        color="secondary"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />} // ✅ arrow added here
      >
        Update Status
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
        <MenuItem onClick={() => handleClose("requested")}>Requested</MenuItem>
        <MenuItem onClick={() => handleClose("pending")}>Pending</MenuItem>
        <MenuItem onClick={() => handleClose("denied")}>Denied</MenuItem>
        <MenuItem onClick={() => handleClose("analysis")}>Analysis</MenuItem>
      </Menu>
  <Button variant="contained" size="small" color="secondary">
    Email Status
  </Button>
  <Button variant="contained" size="small" color="secondary">
    Email Download
  </Button>
  <Button variant="contained" size="small" color="secondary">
    Menu
  </Button>
  <Button variant="contained" size="small" color="secondary">
    Update Supplier
  </Button>
</Box>
      <ToastContainer position="top-right" autoClose={2500} />
    </OPPageContainer>
  );
}
