"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	subscriptionApi,
} from "@/lib/api/subscription";

interface UseSubscriptionActionsProps {
	subscriptionId?: string;
	accountId: string;
}

export function useSubscriptionActions({
	subscriptionId,
	accountId,
}: UseSubscriptionActionsProps) {
	const queryClient = useQueryClient();

	const requireId = () => {
		if (!subscriptionId) {
			throw new Error("Missing subscriptionId");
		}
		return subscriptionId;
	};

	const refresh = () =>
		queryClient.invalidateQueries({
			queryKey: ["subscription", accountId],
	});
	
	const suspendMutation = useMutation({
		mutationFn: (reason: string) =>
			subscriptionApi.suspend(requireId(), { reason }),
		onSuccess: refresh,
	});

	const resumeMutation = useMutation({
		mutationFn: () =>
			subscriptionApi.resume(requireId()),
		onSuccess: refresh,
	});

	const cancelMutation = useMutation({
		mutationFn: (reason: string) =>
			subscriptionApi.cancel(requireId(), { reason }),
		onSuccess: refresh,
	});

	const extendMutation = useMutation({
		mutationFn: () =>
			subscriptionApi.extend(requireId(), {
				days: 30,
				reason: "Admin extension",
			}),
	});

	const renewMutation = useMutation({
		mutationFn: () =>
			subscriptionApi.renew(requireId()),
		onSuccess: refresh,
	});

	const forceExpireMutation = useMutation({
		mutationFn: () =>
			subscriptionApi.forceExpire(requireId()),
		onSuccess: refresh,
	});

	const isWorking =
		suspendMutation.isPending ||
		resumeMutation.isPending ||
		cancelMutation.isPending ||
		extendMutation.isPending ||
		renewMutation.isPending ||
		forceExpireMutation.isPending;

	return {
		refresh,
		suspendMutation,
		resumeMutation,
		cancelMutation,
		extendMutation,
		renewMutation,
		forceExpireMutation,
		isWorking,
	};
}