"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Plan } from "@/features/plans/types/plans.types";
import { unwrap } from "@/lib/api/unwrap";
import type { ApiResponse } from "@/types/api-response";
import { adminSubscriptionsApi, subscriptionsApi } from "../services/subscriptions.api";
import type { AdminCreateSubscriptionBody, AdminSubscriptionDetail, AdminSubscriptionListParams } from "../types/subscriptions.types";

export const ADMIN_SUBSCRIPTIONS_KEY = ["subscriptions", "admin"] as const;
const ADMIN_PAGE_SIZE = 12;

export function useSubscriptions() {
	return useQuery({
		queryKey: ["subscriptions", "me"],
		queryFn: async () => unwrap(await subscriptionsApi.listMine()).data,
	});
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

export function useAccountSubscriptions(accountId: string) {
	return useAdminSubscriptions({ accountId, limit: 20 });
}


function useAdminSubscriptionAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["usage"] });
		},
	});
}

export function useAdminSubscription(id: string) {
	return useQuery({
		queryKey: [...ADMIN_SUBSCRIPTIONS_KEY, "detail", id],
		queryFn: async (): Promise<AdminSubscriptionDetail> => {
			const data = unwrap(await adminSubscriptionsApi.get(id)).data;
			return { ...data, account: data.account ?? null, router: data.router ?? null, routers: data.routers ?? [] };
		},
		refetchInterval: (query) => (query.state.data?.subscription.mikrotikStatus === "pending" ? 4000 : false),
	});
}

export function useAdminSubscriptionActions() {
	return {
		create: useAdminSubscriptionAction(({ idempotencyKey, ...body }: AdminCreateSubscriptionBody & { idempotencyKey?: string }) =>
			adminSubscriptionsApi.create(body, idempotencyKey)
		),
		changePlan: useAdminSubscriptionAction((v: { id: string; newPlanId: string; idempotencyKey?: string }) =>
			adminSubscriptionsApi.changePlan(v.id, v.newPlanId, v.idempotencyKey)
		),
		suspend: useAdminSubscriptionAction((v: { id: string; reason?: string }) => adminSubscriptionsApi.suspend(v.id, v.reason)),
		resume: useAdminSubscriptionAction(adminSubscriptionsApi.resume),
		cancel: useAdminSubscriptionAction((v: { id: string; reason?: string }) => adminSubscriptionsApi.cancel(v.id, v.reason)),
		extend: useAdminSubscriptionAction((v: { id: string; days: number; reason?: string; idempotencyKey?: string }) =>
			adminSubscriptionsApi.extend(v.id, v.days, v.reason, v.idempotencyKey)
		),
		forceExpire: useAdminSubscriptionAction((v: { id: string; reason?: string }) => adminSubscriptionsApi.forceExpire(v.id, v.reason)),
		resync: useAdminSubscriptionAction((v: { id: string; routerId?: string }) => adminSubscriptionsApi.resync(v.id, v.routerId)),
	};
}