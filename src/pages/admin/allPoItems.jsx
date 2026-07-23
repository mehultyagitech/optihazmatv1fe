import React, { useState } from 'react';
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

const productRows = [
  { id: 1, supplierName: 'Mares Shipping GmbH', brandName: 'NONE', hazMat: 'NONE', hazMatMass: 0, isOfflanded: 'NO', isInstalled: 'NO', installedQty: '-', replacedQty: 0, removedQty: 0, productDesc: 'BersonUVlamp40VIMod' },
  { id: 2, supplierName: 'Mares Shipping GmbH', brandName: 'NONE', hazMat: 'NONE', hazMatMass: 0, isOfflanded: 'NO', isInstalled: 'NO', installedQty: '-', replacedQty: 0, removedQty: 0, productDesc: 'ORINGSEAL' },
  { id: 3, supplierName: 'Mares Shipping GmbH', brandName: 'NONE', hazMat: 'NONE', hazMatMass: 0, isOfflanded: 'NO', isInstalled: 'NO', installedQty: '-', replacedQty: 0, removedQty: 0, productDesc: 'ORing' },
];

const rows = [
  {
    id: 1,
    clientName: 'HAMMONIA',
    shipName: 'KOGA RANGER',
    po: '01482478011924',
    supplierName: 'Mares Shipping GmbH',
    vdrive: '📂',
    docStatus: 'not_started',
    isHazmat: 'not-containing',
    isHazmatExpected: 'NO',
    poRcvdate: '31-Dec-2024',
    uploadDate: '27-Jan-2025',
    docRcvdDate: '01-Jan-2000',
    refNo: 'KN/IN24-12889',
    shipImo: '9277280',
  },
  {
    id: 2,
    clientName: 'HAMMONIA',
    shipName: 'KOGA ROYAL',
    po: '01262482012671',
    supplierName: 'Mares Shipping GmbH',
    vdrive: '📂',
    docStatus: 'not_started',
    isHazmat: 'not-containing',
    isHazmatExpected: 'NO',
    poRcvdate: '31-Dec-2024',
    uploadDate: '27-Jan-2025',
    docRcvdDate: '01-Jan-2000',
    refNo: 'RI/IN24-13094',
    shipImo: '9267754',
  },
  {
    id: 3,
    clientName: 'HAMMONIA',
    shipName: 'KOGA ROYAL',
    po: '01262482012671',
    supplierName: 'Mares Shipping GmbH',
    vdrive: '📂',
    docStatus: 'not_started',
    isHazmat: 'not-containing',
    isHazmatExpected: 'NO',
    poRcvdate: '31-Dec-2024',
    uploadDate: '27-Jan-2025',
    docRcvdDate: '01-Jan-2000',
    refNo: 'RI/IN24-13094',
    shipImo: '9267754',
  },
  {
    id: 4,
    clientName: 'HAMMONIA',
    shipName: 'KOGA ROYAL',
    po: '01262482012671',
    supplierName: 'Mares Shipping GmbH',
    vdrive: '📂',
    docStatus: 'not_started',
    isHazmat: 'not-containing',
    isHazmatExpected: 'NO',
    poRcvdate: '31-Dec-2024',
    uploadDate: '27-Jan-2025',
    docRcvdDate: '01-Jan-2000',
    refNo: 'RI/IN24-13094',
    shipImo: '9267754',
  },
];

export default function AllPoItems() {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const apiRef = useGridApiRef();

  // Real counts derived from the data
  const poCount = new Set(rows.map((r) => r.po)).size;
  const itemCount = rows.length;
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
  <DialogTitle>Product List (PO: {selectedPo})</DialogTitle>
  <DialogContent>
    <Box sx={{ height: 400 }}>
      <DataGrid
        rows={productRows}
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
          <Button variant="contained" size="small" color="primary">
            Download Excel
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box >
        <DataGrid
          apiRef={apiRef}
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
<Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="lg">
        <DialogTitle>Product List (PO: {selectedPo})</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={productRows}
              columns={productColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>

          {/* Footer Buttons */}
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
    </OPPageContainer>
  );
}
