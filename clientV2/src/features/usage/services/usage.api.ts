import { API } from "@/lib/api/api-client";
import type { Usage, UsageRecord, UsageStats } from "../types/usage.types";

export const usageApi = {
	get: (accountId: string) => API.get<Usage>(`/usage/accounts/${accountId}/me`),
};

export const adminUsageApi = {
	stats: (subscriptionId: string) => API.get<UsageStats>(`/usage/admin/subscriptions/${subscriptionId}/stats`),
	records: (subscriptionId: string, params: { page?: number; limit?: number }) =>
		API.get<UsageRecord[]>(`/usage/admin/subscriptions/${subscriptionId}`, { params }),
};