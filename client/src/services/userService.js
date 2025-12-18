import API from "../Api/axios"; // your axios instance
import { handleError } from "../utils/handleError";

//--------------------------------------------------
// 1️⃣ GET DASHBOARD DATA
//--------------------------------------------------
export const getDashboardData = async () => {
    try {
        const { data } = await API.get("/users/dashboard");
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

//--------------------------------------------------
// 2️⃣ UPDATE USER DETAILS
//--------------------------------------------------
export const updateUserDetails = async (updates) => {
    try {
        // updates can now include themePreference
        const { data } = await API.put("/users/me", updates);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};


//--------------------------------------------------
// 3️⃣ UPDATE SUBSCRIPTION PLAN
//--------------------------------------------------
export const updateSubscription = async (newPlanId) => {
    try {
        const { data } = await API.put("/users/me/subscription", { newPlanId });
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

//--------------------------------------------------
// 4️⃣ CHANGE PASSWORD
//--------------------------------------------------
export const changePassword = async (oldPassword, newPassword) => {
    try {
        const { data } = await API.put("/users/me/password", { oldPassword, newPassword });
        return data;
    } catch (error) {
        throw handleError(error);
    }
};
