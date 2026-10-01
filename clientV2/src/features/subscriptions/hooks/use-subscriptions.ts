"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { subscriptionsApi } from "../services/subscriptions.api";

export function useSubscriptions() {
	return useQuery({
		queryKey: ["subscriptions", "me"],
		queryFn: async () => unwrap(await subscriptionsApi.listMine()).data,
	});
}