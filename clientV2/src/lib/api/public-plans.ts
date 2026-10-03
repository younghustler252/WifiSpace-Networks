import type { Plan, PlanServiceType } from "@/features/plans/types/plans.types";
import type { ApiResponse } from "@/types/api-response";
import { getApiBaseUrl } from "./get-api-base-url";

export async function getPublicPlans(serviceType: PlanServiceType): Promise<Plan[] | null> {
	try {
		const res = await fetch(`${getApiBaseUrl()}/plans?serviceType=${serviceType}`, { next: { revalidate: 300 } });
		if (!res.ok) return null;

		const json = (await res.json()) as ApiResponse<Plan[]>;
		if (!json.success) return null;

		return json.data.filter((plan) => plan.status === "active").sort((a, b) => a.price - b.price);
	} catch {
		return null;
	}
}