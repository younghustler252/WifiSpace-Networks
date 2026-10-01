"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { can } from "@/lib/rbac";
import type { Role } from "@/types/roles";
import { normalizeDashboard } from "../lib/normalize-dashboard";
import { dashboardApi } from "../services/dashboard.api";

export function useDashboard(role: Role | undefined) {
	const isAdmin = can(role, "dashboard:revenue");

	return useQuery({
		queryKey: ["dashboard", isAdmin ? "admin" : "staff"],
		enabled: can(role, "admin:access"),
		queryFn: async () => {
			const res = isAdmin ? await dashboardApi.admin() : await dashboardApi.staff();
			return normalizeDashboard(unwrap(res).data);
		},
		refetchInterval: 60_000,
	});
}