import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import type { Plan } from "@/features/plans/types/plans.types";
import { ROUTER_ERROR_MESSAGES } from "@/features/routers/constants";
import type { AdminSubscriptionDetail } from "../types/subscriptions.types";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../constants";
import type { AdminCreateSubscriptionBody, AdminSubscriptionListParams, Subscription, UpgradeOption } from "../types/subscriptions.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, SUBSCRIPTION_ERROR_MESSAGES));

export const subscriptionsApi = {
	listMine: () => withMessages(API.get<Subscription[]>("/subscriptions/me")),
	upgradeOptions: async (accountId: string): Promise<ApiResponse<Plan[]>> =>
		friendly(
			await API.get<Plan[]>("/subscriptions/upgrade-options", { params: { accountId } }),
			SUBSCRIPTION_ERROR_MESSAGES
		),
};

const ADMIN = "/subscriptions/admin";

export const adminSubscriptionsApi = {
	list: (params: AdminSubscriptionListParams) => withMessages(API.get<Subscription[]>(ADMIN, { params })),
	create: (body: AdminCreateSubscriptionBody) => withMessages(API.post<Subscription>(ADMIN, body)),
	renew: (id: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/renew`)),
	changePlan: (id: string, newPlanId: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/change-plan`, { newPlanId })),
	suspend: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/suspend`, { reason })),
	resume: (id: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/resume`)),
	cancel: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/cancel`, { reason })),
	extend: (id: string, days: number, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/extend`, { days, reason })),
	forceExpire: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/force-expire`, { reason })),
	get: (id: string) => withMessages(API.get<AdminSubscriptionDetail>(`${ADMIN}/${id}`)),
	resync: async (id: string, routerId?: string) =>
		friendly(
			await API.post<unknown>(`${ADMIN}/${id}/resync`, routerId ? { routerId } : {}),
			{ ...SUBSCRIPTION_ERROR_MESSAGES, ...ROUTER_ERROR_MESSAGES }
		),
};