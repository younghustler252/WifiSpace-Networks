"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { auditApi } from "../services/audit.api";

export function useAdminAudit(page: number) {
	return useQuery({
		queryKey: ["audit", "admin", page],
		queryFn: async () => {
			const res = unwrap(await auditApi.listAll({ page, limit: 20 }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function useMyAudit(limit = 8) {
	return useQuery({
		queryKey: ["audit", "me", limit],
		queryFn: async () => unwrap(await auditApi.listMine({ page: 1, limit })).data,
	});
}