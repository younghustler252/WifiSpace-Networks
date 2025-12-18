import API from "../Api/axios"; // your axios instance
import { handleError } from "../utils/handleError";

// --------------------------------------------------
// 1️⃣ GET DASHBOARD DATA
// --------------------------------------------------
export const getDashboardData = async () => {
    try {
        const { data } = await API.get("/admin/dashboard");
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// --------------------------------------------------
// 2️⃣ SUBSCRIPTIONS (ADMIN)
// --------------------------------------------------
export const createSubscription = async (subscription) => {
    try {
        const { data } = await API.post("/admin/subscriptions", subscription);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSubscription = async (id, updates) => {
    try {
        const { data } = await API.put(`/admin/subscriptions/${id}`, updates);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteSubscription = async (id) => {
    try {
        const { data } = await API.delete(`/admin/subscriptions/${id}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// --------------------------------------------------
// 3️⃣ USERS (ADMIN)
// --------------------------------------------------
// Updated getAllUsers function with dynamic query parameters
export const getAllUsers = async (filters = {}, sort = "", page = 1, limit = 10) => {
    try {
        // Build the query string with the parameters for filtering, sorting, and pagination
        const queryParams = new URLSearchParams();

        // Add filters if they exist
        if (filters) {
            queryParams.append('filter', JSON.stringify(filters));
        }

        // Add sorting if specified
        if (sort) {
            queryParams.append('sort', sort);
        }

        // Add pagination parameters
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const { data } = await API.get(`/admin/users?${queryParams.toString()}`);
        return data;
    } catch (error) {
        throw handleError(error);  // Handle errors
    }
};


export const createUser = async (userData) => {
    try {
        const { data } = await API.post("/admin/users", userData);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getUserById = async (id) => {
    try {
        const { data } = await API.get(`/admin/users/${id}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getUserByWsn = async (wsnId) => {
    try {
        const { data } = await API.get(`/admin/users/wsn/${wsnId}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchUsers = async (query) => {
    try {
        const { data } = await API.get(`/admin/users/search?query=${encodeURIComponent(query)}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const banUser = async (id, ban = true) => {
    try {
        const { data } = await API.put(`/admin/users/ban/${id}`, { ban });
        return data;
    } catch (error) {
        throw handleError(error);
    }
};
