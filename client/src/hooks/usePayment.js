import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    initiatePayment,
    verifyPaymentStatus,
    getMyPayments,
    getSinglePayment,
} from "../services/paymentService";

// ------------------------------------------------------------
// 1️⃣ Initiate Payment
// ------------------------------------------------------------
export const useInitiatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: initiatePayment,
        onSuccess: (data) => {
            // Optionally, you can trigger other queries or actions on success
            // For example, redirect the user to Paystack URL
            window.location.href = data.paymentUrl;
        },
    });
};

// ------------------------------------------------------------
// 2️⃣ Verify Payment Status
// ------------------------------------------------------------
export const useVerifyPaymentStatus = () => {
    return useMutation({
        mutationFn: verifyPaymentStatus,
        onSuccess: (data) => {
            // Handle successful payment verification (e.g., show confirmation message)
            console.log("Payment verified successfully", data);
        },
        onError: (error) => {
            console.error("Payment verification failed", error);
        },
    });
};

// ------------------------------------------------------------
// 3️⃣ Fetch All Payments for a User
// ------------------------------------------------------------
export const useMyPayments = () => {
    return useQuery({
        queryKey: ['myPayments'],
        queryFn: getMyPayments,
        staleTime: 1000 * 60 * 5,
    });
};

// ------------------------------------------------------------
// 4️⃣ Get Single Payment by Transaction ID
// ------------------------------------------------------------
export const useSinglePayment = (transactionId) => {
    return useQuery({
        queryKey: ["singlePayment", transactionId],
        queryFn: () => getSinglePayment(transactionId),
        enabled: !!transactionId, // Only fetch if transactionId is available
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: false, // Optional: Don't refetch on window focus
    });
};
