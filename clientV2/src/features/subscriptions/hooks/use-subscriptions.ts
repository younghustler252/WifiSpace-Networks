"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import type { ApiResponse } from "@/types/api-response";
import type { Plan } from "@/features/plans/types/plans.types";
import { adminSubscriptionsApi, subscriptionsApi } from "../services/subscriptions.api";
import type { AdminSubscriptionListParams } from "../types/subscriptions.types";

export const ADMIN_SUBSCRIPTIONS_KEY = ["subscriptions", "admin"] as const;
const ADMIN_PAGE_SIZE = 12;

export function useSubscriptions() {
	return useQuery({
		queryKey: ["subscriptions", "me"],
		queryFn: async () => unwrap(await subscriptionsApi.listMine()).data,
	});
}

export function useAdminSubscriptions(params: AdminSubscriptionListParams) {
	return useQuery({
		queryKey: [...ADMIN_SUBSCRIPTIONS_KEY, params],
		queryFn: async () => {
			const res = unwrap(await adminSubscriptionsApi.list({ limit: ADMIN_PAGE_SIZE, ...params }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

function useAdminSubscriptionAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (res) => {
			if (!res.success) return;
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["usage"] });
		},
	});
}

export function useAdminSubscriptionActions() {
	return {
		create: useAdminSubscriptionAction(adminSubscriptionsApi.create),
		renew: useAdminSubscriptionAction(adminSubscriptionsApi.renew),
		changePlan: useAdminSubscriptionAction((v: { id: string; newPlanId: string }) =>
			adminSubscriptionsApi.changePlan(v.id, v.newPlanId)
		),
		suspend: useAdminSubscriptionAction((v: { id: string; reason?: string }) => adminSubscriptionsApi.suspend(v.id, v.reason)),
		resume: useAdminSubscriptionAction(adminSubscriptionsApi.resume),
		cancel: useAdminSubscriptionAction((v: { id: string; reason?: string }) => adminSubscriptionsApi.cancel(v.id, v.reason)),
		extend: useAdminSubscriptionAction((v: { id: string; days: number; reason?: string }) =>
			adminSubscriptionsApi.extend(v.id, v.days, v.reason)
		),
		forceExpire: useAdminSubscriptionAction((v: { id: string; reason?: string }) =>
			adminSubscriptionsApi.forceExpire(v.id, v.reason)
		),
	};
}

export function useUpgradeOptions(accountId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["subscriptions", "upgrade-options", accountId],
		enabled: !!accountId && enabled,
		queryFn: async (): Promise<Plan[]> => {
			const plans = unwrap(await subscriptionsApi.upgradeOptions(accountId!)).data;
			return [...plans].sort((a, b) => a.price - b.price);
		},
		staleTime: 60_000,
	});
}