import { API } from "@/lib/api/api-client";
import type { Plan, PlanServiceType } from "../types/plans.types";

export const plansApi = {
	list: (serviceType: PlanServiceType) => API.get<Plan[]>("/plans", { params: { serviceType } }),
};