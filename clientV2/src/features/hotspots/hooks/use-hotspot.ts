"use client";

import { useQuery } from "@tanstack/react-query";
import { usePollWindow } from "@/hooks/use-poll-window";
import { unwrap } from "@/lib/api/unwrap";
import { hotspotsApi, hotspotsAdminApi } from "../services/hotspots.api";
import type { HotspotClientInfo } from "../types/hotspots.types";

const STATUS_POLL_MS = 2500;
const STATUS_MAX_WAIT_MS = 30_000;

export function useHotspotSession(client: HotspotClientInfo | null) {
	return useQuery({
		queryKey: ["hotspot", "session", client?.macAddress, client?.routerId, client?.routerUid, client?.identity],
		enabled: !!client,
		queryFn: async () => {
			const { macAddress, routerId, routerUid, identity } = client!;
			return unwrap(await hotspotsApi.session({ macAddress, routerId, routerUid, identity })).data;
		},
		refetchInterval: (query) => (query.state.data?.state === "PENDING" ? 3000 : false),
		staleTime: 0,
	});
}

export function useHotspotPlans() {
	return useQuery({
		queryKey: ["hotspot", "plans"],
		queryFn: async () => {
			const plans = unwrap(await hotspotsApi.plans()).data;
			return plans.filter((p) => p.status === "active").sort((a, b) => a.price - b.price);
		},
		staleTime: 5 * 60_000,
	});
}

export function useConnectionStatus(reference: string | null, macAddress: string | null) {
	const poll = usePollWindow(STATUS_MAX_WAIT_MS);

	const query = useQuery({
		queryKey: ["hotspot", "status", reference, macAddress],
		enabled: !!reference && !!macAddress,
		queryFn: async () =>
			unwrap(await hotspotsApi.status({ reference: reference!, macAddress: macAddress! })).data,
		refetchInterval: (q) => {
			const data = q.state.data;
			if (data?.connected || data?.paymentStatus === "failed") return false;
			return poll.isOpen() ? STATUS_POLL_MS : false;
		},
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});

	const connected = query.data?.connected === true;
	const failed = query.data?.paymentStatus === "failed";

	return {
		connected,
		failed,
		timedOut: poll.expired && !connected && !failed,
		restart: () => {
			poll.restart();
			query.refetch();
		},
	};
}


export function useHotspotDevices(accountId: string) {
	return useQuery({
		queryKey: ["hotspot", "admin", "devices", accountId],
		queryFn: async () => unwrap(await hotspotsAdminApi.devices({ accountId })).data,
	});
}

export function useHotspotLocations(accountId: string) {
	return useQuery({
		queryKey: ["hotspot", "admin", "locations", accountId],
		queryFn: async () => unwrap(await hotspotsAdminApi.locations({ accountId })).data,
	});
}