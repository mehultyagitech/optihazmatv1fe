import axiosInstance from '../axiosInstance';
import { GET_CLIENT_MANAGERS, UPDATE_CLIENT_MANAGERS,DELETE_CLIENT_MANAGERS } from "../endpoints";

export const getAllClientManagers = async () => {
    try {
        const response = await axiosInstance.get(GET_CLIENT_MANAGERS);
        return response.data;
    } catch (error) {
        console.error("Error fetching client managers:", error);
        throw error;
    }
};

export const createClientManagers = async (data) => {
    try {
        const response = await axiosInstance.post(GET_CLIENT_MANAGERS, data);
        return response.data;
    } catch (error) {
        console.error("Error creating client manager:", error);
        throw error;
    }
};

export const updateClientManager = async (id, data) => {
    try {
        const response = await axiosInstance.put(UPDATE_CLIENT_MANAGERS, data);
        return response.data;
    } catch (error) {
        console.error("Error updating client manager:", error);
        throw error;
    }
};

export const deleteClientManager = async (id) => {
    try {
        const response = await axiosInstance.put(DELETE_CLIENT_MANAGERS(id));
        return response.data;
    } catch (error) {
        console.error("Error deleting client manager:", error.response?.data || error.message);
        throw error;
    }
};
