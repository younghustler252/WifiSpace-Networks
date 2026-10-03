"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { adminUsageApi, usageApi } from "../services/usage.api";

export function useUsage(accountId: string) {
	return useQuery({
		queryKey: ["usage", accountId],
		queryFn: async () => unwrap(await usageApi.get(accountId)).data,
		refetchInterval: 60_000,
	});
}

export function useSubscriptionUsageStats(subscriptionId: string) {
	return useQuery({
		queryKey: ["usage", "admin", subscriptionId, "stats"],
		queryFn: async () => unwrap(await adminUsageApi.stats(subscriptionId)).data,
	});
}

export function useSubscriptionUsageRecords(subscriptionId: string, page: number) {
	return useQuery({
		queryKey: ["usage", "admin", subscriptionId, "records", page],
		queryFn: async () => {
			const res = unwrap(await adminUsageApi.records(subscriptionId, { page, limit: 8 }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}