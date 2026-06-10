"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi } from "@/lib/api/usage";



export function useUsage(accountId?: string) {
	return useQuery({
		queryKey: ["usage", accountId],
		queryFn: () => usageApi.getUsage(accountId!),
		enabled: !!accountId,

		// 🔥 keeps previous data on refetch (NO BLANK SCREEN)
		keepPreviousData: true,

		staleTime: 30 * 1000, // 30s cache
		refetchInterval: 10 * 1000 // live-ish updates
	});
}