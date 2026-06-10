import { API } from "./client";
import { ApiResponse } from "./types";

import type {
	UsageSnapshot,
	UsageListResponse,
	SyncUsageDto
} from "@/features/usage/types/usage.types";


// ================================
// USAGE API
// ================================

export const usageApi = {
	// -----------------------------
	// SYNC USAGE (ADMIN ONLY)
	// -----------------------------
	syncUsage: (
		data: SyncUsageDto
	): Promise<ApiResponse<null>> =>
		API.post("/usage/sync", data),

	// -----------------------------
	// GET ALL USAGE (ADMIN DASHBOARD)
	// -----------------------------
	getAllUsage: async (params?: {
		routerId?: string;
		wsnId?: string;
		online?: boolean;

		page?: number;
		limit?: number;
	}): Promise<UsageListResponse> => {
		const res = await API.get("/usage", {
			params
		});

		return res.data;
	},

	// -----------------------------
	// GET SINGLE USAGE (BY ACCOUNT)
	// -----------------------------
	getUsage: (
		accountId: string
	): Promise<ApiResponse<UsageSnapshot>> =>
		API.get(`/usage/${accountId}`)
};