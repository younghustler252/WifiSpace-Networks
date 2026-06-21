import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { subscriptionApi } from "../subscription.api";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { SubscriptionStatus, MikrotikSyncStatus } from "../subscription.types";

type Params = {
	search?: string;

	accountId?: string;
	planId?: string;

	status?: SubscriptionStatus;
	autoRenewEnabled?: boolean;

	mikrotikStatus?: MikrotikSyncStatus;

	expiresFrom?: string;
	expiresTo?: string;

	page?: number;
	limit?: number;
};

export const useAdminSubscriptions = (params: Params) => {
	return useQuery({
		queryKey: [
            "admin-subscriptions",
            params.search,
            params.accountId,
            params.planId,
            params.status,
            params.autoRenewEnabled,
            params.mikrotikStatus,
            params.expiresFrom,
            params.expiresTo,
            params.page,
            params.limit,
            ],
		queryFn: () => subscriptionApi.getAll(params),
        placeholderData: keepPreviousData,
		staleTime: 1000 * 30, // 30s (smooth UX)
	});
};