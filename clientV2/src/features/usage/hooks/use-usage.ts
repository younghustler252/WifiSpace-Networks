"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { usageApi } from "../services/usage.api";

export function useUsage(accountId: string) {
	return useQuery({
		queryKey: ["usage", accountId],
		queryFn: async () => unwrap(await usageApi.get(accountId)).data,
		refetchInterval: 60_000,
	});
}