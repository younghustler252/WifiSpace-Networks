"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { plansApi } from "../services/plans.api";
import type { PlanServiceType } from "../types/plans.types";

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