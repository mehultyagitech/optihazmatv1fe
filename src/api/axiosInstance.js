import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // Important for cookies!
});

export default axiosInstance;
