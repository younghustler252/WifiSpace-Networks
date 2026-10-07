import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import { withIdempotency } from "@/lib/api/idempotency";
import { ROUTER_ERROR_MESSAGES } from "@/features/routers/constants";
import type { Plan } from "@/features/plans/types/plans.types";
import type { ApiResponse } from "@/types/api-response";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../constants";
import type {
	AdminCreateSubscriptionBody,
	AdminSubscriptionDetailRaw,
	AdminSubscriptionListParams,
	Subscription,
} from "../types/subscriptions.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, SUBSCRIPTION_ERROR_MESSAGES));

export const subscriptionsApi = {
	listMine: () => withMessages(API.get<Subscription[]>("/subscriptions/me")),
	upgradeOptions: async (accountId: string): Promise<ApiResponse<Plan[]>> =>
		friendly(await API.get<Plan[]>("/subscriptions/upgrade-options", { params: { accountId } }), SUBSCRIPTION_ERROR_MESSAGES),
};

const ADMIN = "/subscriptions/admin";

export const adminSubscriptionsApi = {
	list: (params: AdminSubscriptionListParams) => withMessages(API.get<Subscription[]>(ADMIN, { params })),
	get: (id: string) => withMessages(API.get<AdminSubscriptionDetailRaw>(`${ADMIN}/${id}`)),
	create: (body: AdminCreateSubscriptionBody, key?: string) =>
		withMessages(API.post<Subscription>(ADMIN, body, withIdempotency(key))),
	renew: (id: string, key?: string) =>
		withMessages(API.patch<Subscription>(`${ADMIN}/${id}/renew`, undefined, withIdempotency(key))),
	changePlan: (id: string, newPlanId: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/change-plan`, { newPlanId })),
	suspend: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/suspend`, { reason })),
	resume: (id: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/resume`)),
	cancel: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/cancel`, { reason })),
	extend: (id: string, days: number, reason?: string, key?: string) =>
		withMessages(API.patch<Subscription>(`${ADMIN}/${id}/extend`, { days, reason }, withIdempotency(key))),
	forceExpire: (id: string, reason?: string) => withMessages(API.patch<Subscription>(`${ADMIN}/${id}/force-expire`, { reason })),
	resync: async (id: string, routerId?: string) =>
		friendly(await API.post<unknown>(`${ADMIN}/${id}/resync`, routerId ? { routerId } : {}), {
			...SUBSCRIPTION_ERROR_MESSAGES,
			...ROUTER_ERROR_MESSAGES,
		}),
};