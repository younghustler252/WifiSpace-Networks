import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { routerApi } from "../api/router.api";
import type {
	CreateRouterDto,
	Router,
	UpdateRouterDto,
} from "../api/router.types";

// ======================================
// QUERY KEYS
// ======================================

export const routerKeys = {
	all: ["routers"] as const,
	detail: (id: string) => ["routers", id] as const,
	profiles: (id: string, service: "pppoe" | "hotspot") =>
		["routers", id, "profiles", service] as const,
};

// ======================================
// LIST ROUTERS
// ======================================

export function useRouters() {
	return useQuery({
		queryKey: routerKeys.all,
		queryFn: routerApi.list,
		select: (response) => response.data,
	});
}

// ======================================
// CREATE ROUTER
// ======================================

export function useCreateRouter() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRouterDto) =>
			routerApi.create(data),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: routerKeys.all,
			});
		},
	});
}

// ======================================
// UPDATE ROUTER
// ======================================

export function useUpdateRouter() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateRouterDto;
		}) => routerApi.update(id, data),

		onSuccess: (response) => {
			queryClient.invalidateQueries({
				queryKey: routerKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					routerKeys.detail(response.data.id),
					response.data
				);
			}
		},
	});
}

// ======================================
// DELETE ROUTER
// ======================================

export function useDeleteRouter() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			routerApi.remove(id),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: routerKeys.all,
			});
		},
	});
}

// ======================================
// SYNC ROUTER
// ======================================

export function useSyncRouter() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			routerApi.sync(id),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: routerKeys.all,
			});
		},
	});
}

// ======================================
// REBOOT ROUTER
// ======================================

export function useRebootRouter() {
	return useMutation({
		mutationFn: (id: string) =>
			routerApi.reboot(id),
	});
}

// ======================================
// CHECK STATUS
// ======================================

export function useCheckRouterStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			routerApi.checkStatus(id),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: routerKeys.all,
			});
		},
	});
}

// ======================================
// ROUTER PROFILES
// ======================================

export function useRouterProfiles(
	routerId?: string,
	serviceType: "pppoe" | "hotspot" = "pppoe"
) {
	return useQuery({
		queryKey:
			routerId
				? routerKeys.profiles(routerId, serviceType)
				: ["router-profiles"],
		queryFn: () =>
			routerApi.getProfiles(routerId!, serviceType),
		select: (response) => response.data,
		enabled: !!routerId,
	});
}