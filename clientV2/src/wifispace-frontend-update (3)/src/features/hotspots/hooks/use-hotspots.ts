"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePollWindow } from "@/hooks/use-poll-window";
import { unwrap } from "@/lib/api/unwrap";
import { hotspotsApi, hotspotsAdminApi } from "../services/hotspots.api";
import type { HotspotClientInfo } from "../types/hotspots.types";

export const ACTIVATION_MAX_WAIT_MS = 90_000;
const SESSION_POLL_MS = 3000;
const STATUS_POLL_MS = 2500;
const STATUS_MAX_WAIT_MS = 45_000;

export function useHotspotSession(client: HotspotClientInfo | null, pollOpen: () => boolean = () => true) {
	return useQuery({
		queryKey: ["hotspot", "session", client?.macAddress, client?.routerId, client?.routerUid, client?.identity],
		enabled: !!client,
		queryFn: async () => {
			const { macAddress, ipAddress, routerId, routerUid, identity } = client!;
			return unwrap(await hotspotsApi.session({ macAddress, ipAddress, routerId, routerUid, identity })).data;
		},
		refetchInterval: (query) => {
			const state = query.state.data?.state;
			if (state === "PENDING" || state === "ACTIVATING") return pollOpen() ? SESSION_POLL_MS : false;
			return false;
		},
		staleTime: 0,
	});
}

export function useRevokeDevice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (macAddress: string) => hotspotsApi.revoke(macAddress),
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ["hotspot", "session"] });
		},
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
		queryFn: async () => unwrap(await hotspotsApi.status({ reference: reference!, macAddress: macAddress! })).data,
		refetchInterval: (q) => {
			const stage = q.state.data?.stage;
			if (stage === "connected" || stage === "payment_failed" || stage === "provisioning_failed") return false;
			return poll.isOpen() ? STATUS_POLL_MS : false;
		},
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});

	const data = query.data;
	const stage = data?.stage ?? "awaiting_payment";
	const connected = stage === "connected" || data?.connected === true;
	const paymentFailed = stage === "payment_failed" || data?.paymentStatus === "failed" || data?.paymentStatus === "expired";
	const activationFailed = stage === "provisioning_failed";

	return {
		stage,
		connected,
		paymentFailed,
		activationFailed,
		expiresAt: data?.expiresAt ?? null,
		timedOut: poll.expired && !connected && !paymentFailed && !activationFailed,
		restart: () => {
			poll.restart();
			query.refetch();
		},
	};
}

const CONNECTIONS_PAGE_SIZE = 8;

export function useHotspotDevices(params: { accountId?: string; userId?: string }, page: number) {
	return useQuery({
		queryKey: ["hotspot", "admin", "devices", params, page],
		enabled: !!(params.accountId || params.userId),
		queryFn: async () => {
			const res = unwrap(await hotspotsAdminApi.devices({ ...params, page, limit: CONNECTIONS_PAGE_SIZE }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function useHotspotLocations(accountId: string, page: number) {
	return useQuery({
		queryKey: ["hotspot", "admin", "locations", accountId, page],
		queryFn: async () => {
			const res = unwrap(await hotspotsAdminApi.locations({ accountId, page, limit: CONNECTIONS_PAGE_SIZE }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}
