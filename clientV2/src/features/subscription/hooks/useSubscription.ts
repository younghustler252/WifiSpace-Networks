"use client";

import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "@/features/subscription/subscription.api";

export function useSubscription(accountId: string) {
	const {
		data,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["subscription", accountId],
		queryFn: () =>
			subscriptionApi.getCurrentSubscription(accountId),
		enabled: !!accountId,
	});

	return {
		subscription: data?.data,
		isLoading,
		error,
		refetch,
	};
}