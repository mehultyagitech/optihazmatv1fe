import axiosInstance from '../axiosInstance';
import {USER_LOGIN} from "../endpoints";
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(USER_LOGIN, { email, password });
    return response.data; // Return the data from the API response
  } catch (error) {
    throw error.response ? error.response.data : error.message; // Handle errors
  }
};
