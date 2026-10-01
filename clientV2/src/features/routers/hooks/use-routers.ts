"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { routersApi } from "../services/routers.api";

export function useRouters(enabled = true) {
	return useQuery({
		queryKey: ["routers", "list"],
		enabled,
		queryFn: async () => unwrap(await routersApi.list()).data,
		staleTime: 60_000,
	});
}