"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeProfiles } from "../lib/normalize-profiles";
import { unwrap } from "@/lib/api/unwrap";
import type { ApiResponse } from "@/types/api-response";
import { routersApi } from "../services/routers.api";
import type { UpdateRouterBody } from "../types/routers.types";

export const ROUTERS_KEY = ["routers"] as const;

export function useRouters(params: { page?: number; limit?: number } = {}, enabled = true) {
	return useQuery({
		queryKey: [...ROUTERS_KEY, "list", params],
		enabled,
		queryFn: async () => {
			const res = unwrap(await routersApi.list(params));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}

function useRouterAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ROUTERS_KEY });
		},
	});
}

export function useRouterActions() {
	return {
		create: useRouterAction(routersApi.create),
		update: useRouterAction((v: { id: string; body: UpdateRouterBody }) => routersApi.update(v.id, v.body)),
		sync: useRouterAction(routersApi.sync),
		syncAll: useRouterAction(() => routersApi.syncAll()),
		reboot: useRouterAction(routersApi.reboot),
		remove: useRouterAction(routersApi.remove),

	};
}


export function useRouterProfiles(routerId: string | undefined, serviceType: string) {
	return useQuery({
		queryKey: [...ROUTERS_KEY, "profiles", routerId, serviceType],
		enabled: !!routerId,
		queryFn: async () => normalizeProfiles(unwrap(await routersApi.profiles(routerId!, serviceType)).data),
		staleTime: 60_000,
	});
}