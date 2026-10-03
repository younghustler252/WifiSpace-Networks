"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import type { ApiResponse } from "@/types/api-response";
import { adminPlansApi, plansApi } from "../services/plans.api";
import type { PlanServiceType, UpdatePlanBody } from "../types/plans.types";

export const ADMIN_PLANS_KEY = ["plans", "admin"] as const;

export function usePlans(serviceType: PlanServiceType | undefined) {
	return useQuery({
		queryKey: ["plans", serviceType],
		enabled: !!serviceType,
		queryFn: async () => {
			const plans = unwrap(await plansApi.list(serviceType!)).data;
			return plans.filter((p) => p.status === "active").sort((a, b) => a.price - b.price);
		},
		staleTime: 5 * 60_000,
	});
}

export function useAdminPlans() {
	return useQuery({
		queryKey: ADMIN_PLANS_KEY,
		queryFn: async () => unwrap(await adminPlansApi.list({ limit: 100 })).data.filter((p) => !p.deletedAt),
	});
}

function useAdminPlanAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (res) => {
			if (!res.success) return;
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			queryClient.invalidateQueries({ queryKey: ["hotspot", "plans"] });
		},
	});
}

export function useAdminPlanActions() {
	return {
		create: useAdminPlanAction(adminPlansApi.create),
		update: useAdminPlanAction((v: { id: string; body: UpdatePlanBody }) => adminPlansApi.update(v.id, v.body)),
		remove: useAdminPlanAction(adminPlansApi.remove),
		activate: useAdminPlanAction(adminPlansApi.activate),
		deactivate: useAdminPlanAction(adminPlansApi.deactivate),
	};
}