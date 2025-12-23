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
// --------------------------------------------------
// 1️⃣ GET ALL PAYMENTS (with filters & pagination)
// --------------------------------------------------
export const getAllPayments = async ({
    status,
    wsnId,
    planName,
    startDate,
    endDate,
    page = 1,
    limit = 50,
}) => {
    try {
        const queryParams = new URLSearchParams();

        if (status) queryParams.append("status", status);
        if (wsnId) queryParams.append("wsnId", wsnId);
        if (planName) queryParams.append("planName", planName);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        queryParams.append("page", page);
        queryParams.append("limit", limit);

        const { data } = await API.get(
            `/admin/payments?${queryParams.toString()}`
        );

        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// --------------------------------------------------
// 2️⃣ GET SINGLE PAYMENT
// --------------------------------------------------
export const getSinglePayment = async (transactionId) => {
    try {
        const { data } = await API.get(`/admin/payments/${transactionId}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// --------------------------------------------------
// 3️⃣ MANUAL ACTIVATE PAYMENT
// --------------------------------------------------
export const activatePaymentManually = async (transactionId) => {
    try {
        const { data } = await API.put(`/admin/payments/activate/${transactionId}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// --------------------------------------------------
// 4️⃣ PAYMENT ANALYTICS
// --------------------------------------------------
export const getPaymentAnalytics = async () => {
    try {
        const { data } = await API.get("/admin/payments/analytics");
        return data;
    } catch (error) {
        throw handleError(error);
    }
};