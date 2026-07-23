import axiosInstance from '../axiosInstance';
import { GET_USERS, CREATE_USER, UPDATE_USER } from '../endpoints';

export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get(GET_USERS);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        throw error.response ? error.response.data : error;
    }
};

export const createUser = async (data) => {
    try {
        const response = await axiosInstance.post(CREATE_USER, data);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error.response?.data || error.message);
        throw error.response ? error.response.data : error;
    }
};

export const updateUser = async (id, data) => {
    try {
        const response = await axiosInstance.put(UPDATE_USER(id), data);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error.response?.data || error.message);
        throw error.response ? error.response.data : error;
    }
};
