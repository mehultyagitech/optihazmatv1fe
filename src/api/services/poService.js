import axiosInstance from '../axiosInstance';

export const getPurchaseOrders = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/purchase-orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};

export const uploadPurchaseOrders = async (rows) => {
  try {
    const response = await axiosInstance.post('/purchase-orders/bulk', { rows });
    return response.data;
  } catch (error) {
    console.error('Error uploading purchase orders:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};

// Map backend PO records (with items) to the grid rows + per-PO item map.
export const mapPosToGrid = (purchaseOrders = []) => {
  const rows = purchaseOrders.map((po, idx) => {
    const items = po.items || [];
    const anyHazmat = items.some(
      (i) => String(i.canContainHazmat).toUpperCase() === 'YES'
    );
    return {
      id: idx + 1,
      clientName: po.clientName || '',
      shipName: po.shipName || '',
      po: po.poNumber,
      supplierName: po.supplier || '',
      vdrive: '📂',
      docStatus: po.docStatus || 'not_started',
      isHazmat: anyHazmat ? 'expected' : 'not-containing',
      isHazmatExpected: anyHazmat ? 'YES' : 'NO',
      poRcvdate: po.orderRcvDate || '',
      uploadDate: po.createdAt
        ? new Date(po.createdAt).toLocaleDateString('en-GB')
        : '',
      docRcvdDate: '',
      refNo: po.referenceNumber || '',
      shipImo: po.shipImo || '',
      itemCount: items.length,
    };
  });

  const itemsByPo = {};
  purchaseOrders.forEach((po) => {
    itemsByPo[po.poNumber] = (po.items || []).map((it, i) => ({
      id: i + 1,
      supplierName: po.supplier || '',
      brandName: it.brand || 'NONE',
      hazMat:
        String(it.canContainHazmat).toUpperCase() === 'YES' ? 'Possible' : 'NONE',
      hazMatMass: 0,
      isOfflanded: 'NO',
      isInstalled: 'NO',
      installedQty: it.qtyRcv || '-',
      replacedQty: 0,
      removedQty: 0,
      productDesc: it.partDescription || it.product || '',
    }));
  });

  return { rows, itemsByPo };
};
