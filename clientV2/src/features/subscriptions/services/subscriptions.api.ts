import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../constants";
import type { AdminCreateSubscriptionBody, AdminSubscriptionListParams, Subscription } from "../types/subscriptions.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, SUBSCRIPTION_ERROR_MESSAGES));

export const subscriptionsApi = {
	listMine: () => withMessages(API.get<Subscription[]>("/subscriptions/me")),
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
};