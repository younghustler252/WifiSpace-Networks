import API from "../Api/axios"; // Your axios instance
import { handleError } from "../utils/handleError";

//--------------------------------------------------
// 1️⃣ INITIATE PAYMENT
//--------------------------------------------------
export const initiatePayment = async ({ userId, planId, amount, email, planName }) => {
    try {
        const { data } = await API.post("/payments/initiate-payment", {
            userId,
            planId,
            amount,
            email,
            planName,
        });

        return data;  // This would return the Paystack payment URL
    } catch (error) {
        throw handleError(error); // Use your error handler
    }
};

//--------------------------------------------------
// 2️⃣ VERIFY PAYMENT STATUS
//--------------------------------------------------
export const verifyPaymentStatus = async (reference) => {
    try {
        const { data } = await API.get(`/payments/verify-payment?reference=${reference}`);
        return data; // This would return the payment verification response
    } catch (error) {
        throw handleError(error);
    }
};

//--------------------------------------------------
// 3️⃣ GET all PAYMENTS
//--------------------------------------------------
export const getMyPayments = async (userId) => {
    try {
        const { data } = await API.get(`/payments`);
        return data; // This would return an array of all payments for the user
    } catch (error) {
        throw handleError(error);
    }
};

//--------------------------------------------------
// 4️⃣ GET SINGLE PAYMENT BY TRANSACTION ID
//--------------------------------------------------
export const getSinglePayment = async (transactionId) => {
    try {
        const { data } = await API.get(`/payments/${transactionId}`);
        return data; // This would return a single payment object
    } catch (error) {
        throw handleError(error);
    }
};
