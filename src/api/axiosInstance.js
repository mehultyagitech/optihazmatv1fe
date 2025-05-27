import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true, // Important for cookies!
});

export default axiosInstance;
