import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { PLAN_ERROR_MESSAGES } from "../constants";
import type { CreatePlanBody, Plan, PlanServiceType, UpdatePlanBody } from "../types/plans.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, PLAN_ERROR_MESSAGES));

export const plansApi = {
	list: (serviceType: PlanServiceType) => API.get<Plan[]>("/plans", { params: { serviceType } }),
};

const ADMIN = "/plans/admin";

export const adminPlansApi = {
	list: (params: { page?: number; limit?: number }) => withMessages(API.get<Plan[]>(ADMIN, { params })),
	create: (body: CreatePlanBody) => withMessages(API.post<Plan>(ADMIN, body)),
	update: (id: string, body: UpdatePlanBody) => withMessages(API.patch<Plan>(`${ADMIN}/${id}`, body)),
	remove: (id: string) => withMessages(API.delete<unknown>(`${ADMIN}/${id}`)),
	activate: (id: string) => withMessages(API.patch<Plan>(`${ADMIN}/${id}/activate`)),
	deactivate: (id: string) => withMessages(API.patch<Plan>(`${ADMIN}/${id}/deactivate`)),
};