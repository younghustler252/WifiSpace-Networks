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

export const getMikrotikProfiles = async (req, res) => {
    try {
        const data = await API.get('/admin/mikrotik-profiles')
         console.log("Service response:", data)
        return data;
    } catch (error) {
        throw handleError(error);
    }
}

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
    const { data } = await API.post("/admin/users", userData);
    return data;
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

// DELETE USER
export const deleteUserById = async (userId) => {
    try {
        const { data } = await API.delete(`/admin/users/${userId}`);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// ASSIGN / ACTIVATE SUBSCRIPTION
export const assignSubscriptionToUser = async (userId, subscriptionData) => {
    /**
     * subscriptionData example:
     * {
     *    subscriptionId: "123456",
     *    startDate: "2026-02-03T00:00:00Z",   // optional
     *    endDate: "2026-03-03T00:00:00Z"      // optional
     * }
     */
    try {
        const { data } = await API.put(`/admin/users/${userId}/subscription`, subscriptionData);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

// UPDATE USER INFO (ADMIN)
export const updateUserById = async (userId, updateData) => {
    /**
     * updateData example:
     * {
     *    firstName: "John",
     *    lastName: "Doe",
     *    email: "john@example.com",
     *    password: "newpassword",   // optional
     *    macAddress: "00:11:22:33:44:55", // optional
     *    address: "123 Street",     // optional
     *    profile: "premium"         // optional, will update MikroTik
     * }
     */
    try {
        const { data } = await API.put(`/admin/users/${userId}`, updateData);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};



