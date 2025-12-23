import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllPayments as getAllPaymentsApi,
    getSinglePayment as getSinglePaymentApi,
    activatePaymentManually as activatePaymentManuallyApi,
    getPaymentAnalytics as getPaymentAnalyticsApi,
} from "../services/adminService";

// ------------------------------------------------------------
// 1️⃣ Get All Payments (with filters & pagination)
// ------------------------------------------------------------
export const useAllPayments = (filters = {}, page = 1, limit = 50) => {
    return useQuery({
        queryKey: ["payments", filters, page, limit],
        queryFn: () => getAllPaymentsApi({ ...filters, page, limit }),
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
    });
};

// ------------------------------------------------------------
// 2️⃣ Get Single Payment
// ------------------------------------------------------------
export const useSinglePayment = (transactionId) => {
    return useQuery({
        queryKey: ["payment", transactionId],
        queryFn: () => getSinglePaymentApi(transactionId),
        enabled: !!transactionId,
        staleTime: 1000 * 60 * 5,
    });
};

// ------------------------------------------------------------
// 3️⃣ Manual Activate Payment (Admin)
// ------------------------------------------------------------
export const useActivatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionId) => activatePaymentManuallyApi(transactionId),
        onSuccess: () => {
            // Refresh payments and analytics after activation
            queryClient.invalidateQueries(["payments"]);
            queryClient.invalidateQueries(["paymentAnalytics"]);
        },
    });
};

// ------------------------------------------------------------
// 4️⃣ Payment Analytics
// ------------------------------------------------------------
export const usePaymentAnalytics = () => {
    return useQuery({
        queryKey: ["paymentAnalytics"],
        queryFn: getPaymentAnalyticsApi,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
