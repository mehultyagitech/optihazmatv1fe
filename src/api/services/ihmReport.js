import axiosInstance from '../axiosInstance';

export const getIHMReports = async (vesselId) => {
  try {
    const response = await axiosInstance.get(`/vessels/${vesselId}/ihm-reports`);
    return response.data;
  } catch (error) {
    console.error('Error fetching IHM reports:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};

export const generateIHMReport = async (vesselId, payload) => {
  try {
    const response = await axiosInstance.post(`/vessels/${vesselId}/ihm-reports`, payload);
    return response.data;
  } catch (error) {
    console.error('Error generating IHM report:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};

export const updateIHMReport = async (reportId, data) => {
  try {
    const response = await axiosInstance.patch(`/ihm-reports/${reportId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating IHM report:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};

export const deleteIHMReport = async (reportId) => {
  try {
    const response = await axiosInstance.delete(`/ihm-reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting IHM report:', error.response?.data || error.message);
    throw error.response ? error.response.data : error;
  }
};
