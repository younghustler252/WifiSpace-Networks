"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	subscriptionApi,
} from "@/features/subscription/subscription.api";
import type { 
	CreateSubscriptionDto,
	AdminRenewSubscriptionDto, 
	AdminChangePlanDto,
	ExtendSubscriptionDto,
	SubscriptionActionDto
} from "@/features/subscription/subscription.types";

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
	
	const adminCreateSubscriptionMutation = useMutation({
		mutationFn: (data: CreateSubscriptionDto) =>
			subscriptionApi.adminCreate(data),
		onSuccess: refresh,
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
		mutationFn: (data: ExtendSubscriptionDto) =>
			subscriptionApi.extend(requireId(), data),
		onSuccess: refresh,
	});

	const renewMutation = useMutation({
		mutationFn: () =>
			subscriptionApi.renew(requireId()),
		onSuccess: refresh,
	});

	const forceExpireMutation = useMutation({
		mutationFn: (data?: { reason: string }) =>
			subscriptionApi.forceExpire(requireId(), data),
		onSuccess: refresh,
	});

	// ----------------------------------
	// ADMIN OVERRIDES
	// ----------------------------------
	const adminRenewMutation = useMutation({
		mutationFn: (data: Omit<AdminRenewSubscriptionDto, "subscriptionId">) =>
			subscriptionApi.adminRenew({
				subscriptionId: requireId(),
				...data
			}),
		onSuccess: refresh,
	});

	const adminChangePlanMutation = useMutation({
		mutationFn: (data: Omit<AdminChangePlanDto, "accountId">) =>
			subscriptionApi.adminChangePlan({
				accountId,
				...data
			}),
		onSuccess: refresh,
	});

	// 🔥 Added: Sync Hardware Router Command Sequence Execution
	const syncHardwareMutation = useMutation({
		mutationFn: () => 
			subscriptionApi.syncHardware(requireId()),
		onSuccess: refresh,
	});

	const isWorking =
		adminCreateSubscriptionMutation.isPending ||
		suspendMutation.isPending ||
		resumeMutation.isPending ||
		cancelMutation.isPending ||
		extendMutation.isPending ||
		renewMutation.isPending ||
		forceExpireMutation.isPending ||
		adminRenewMutation.isPending ||
		adminChangePlanMutation.isPending ||
		syncHardwareMutation.isPending; // 🔥 Track state inside global loading tracker

	return {
		refresh,
		adminCreateSubscriptionMutation,
		suspendMutation,
		resumeMutation,
		cancelMutation,
		extendMutation,
		renewMutation,
		forceExpireMutation,
		adminRenewMutation,       
		adminChangePlanMutation,  
		syncHardwareMutation,     // 🔥 Exposed to subscription panel page layout
		isWorking,
	};
}
