import { API } from "@/lib/api/api-client";
import type { Usage } from "../types/usage.types";

export const usageApi = {
	get: (accountId: string) => API.get<Usage>(`/usage/accounts/${accountId}/me`),
};