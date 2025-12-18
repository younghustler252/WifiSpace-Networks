import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createSubscription,
	getAllPlans,
	getCurrentSubscription, // Import the new service function
	purchaseSubscription,
	unsubscribeUser,
} from "../services/subscriptionService";

// ------------------------------------------------------------
// 1️⃣ Fetch all subscription plans
// ------------------------------------------------------------
export const useAllPlans = () => {
	return useQuery({
		queryKey: ["plans"],
		queryFn: getAllPlans,
		staleTime: 1000 * 60 * 5, // 5 min cache
		refetchOnWindowFocus: false,
	});
};

// ------------------------------------------------------------
// 2️⃣ Fetch current subscription (User)
// ------------------------------------------------------------
export const useCurrentSubscription = () => {
	return useQuery({
		queryKey: ["currentSubscription"],
		queryFn: async () => {
			const res = await getCurrentSubscription();
			return res.subscription || null; // ✅ return only subscription object
		},
		retry: false, // ✅ prevents infinite retries
	});
};

// ------------------------------------------------------------
// 3️⃣ Admin: Create a new subscription plan
// ------------------------------------------------------------
export const useCreateSubscription = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createSubscription,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
		},
	});
};

// ------------------------------------------------------------
// 4️⃣ User: Purchase a subscription
// ------------------------------------------------------------
export const usePurchaseSubscription = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ planId, paymentMethod }) => purchaseSubscription(planId, paymentMethod),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] }); // optional
			queryClient.invalidateQueries({ queryKey: ["user"] });  // refresh user details
		},
	});
};

// ------------------------------------------------------------
// 5️⃣ User: Cancel subscription
// ------------------------------------------------------------
export const useUnsubscribeUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: unsubscribeUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user"] }); // refresh user details
		},
	});
};
