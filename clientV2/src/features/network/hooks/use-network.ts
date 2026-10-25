"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { networkApi } from "../services/network.api";
import type { HotspotProfileFields, ImportBody, SyncBody, WalledGardenFields } from "../types/network.types";

export const NETWORK_KEY = ["network"] as const;
const STATUS_POLL_MS = 7000;

export function useNetworkStatus() {
	return useQuery({
		queryKey: [...NETWORK_KEY, "status"],
		queryFn: async () => unwrap(await networkApi.status()).data.routers,
		refetchInterval: (query) => {
			const routers = query.state.data;
			const syncing = routers?.some((r) => r.profiles.outOfDate || r.walledGarden.outOfDate);
			return syncing ? STATUS_POLL_MS : false;
		},
	});
}

export function useHotspotProfiles(enabled = true) {
	return useQuery({
		queryKey: [...NETWORK_KEY, "profiles"],
		enabled,
		queryFn: async () => unwrap(await networkApi.profiles()).data,
		staleTime: 60_000,
	});
}

export function useWalledGarden() {
	return useQuery({
		queryKey: [...NETWORK_KEY, "walled-garden"],
		queryFn: async () => unwrap(await networkApi.walledGarden()).data,
	});
}

function useRefreshNetwork() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: NETWORK_KEY });
		queryClient.invalidateQueries({ queryKey: ["plans"] });
	};
}

export function useProfileActions() {
	const refresh = useRefreshNetwork();

	return {
		create: useMutation({ mutationFn: networkApi.createProfile, onSuccess: (res) => res.success && refresh() }),
		update: useMutation({
			mutationFn: (v: { id: string; body: HotspotProfileFields }) => networkApi.updateProfile(v.id, v.body),
			onSuccess: (res) => res.success && refresh(),
		}),
		remove: useMutation({ mutationFn: networkApi.deleteProfile, onSuccess: (res) => res.success && refresh() }),
	};
}

export function useEntryActions() {
	const refresh = useRefreshNetwork();

	return {
		create: useMutation({ mutationFn: networkApi.createEntry, onSuccess: (res) => res.success && refresh() }),
		update: useMutation({
			mutationFn: (v: { id: string; body: WalledGardenFields }) => networkApi.updateEntry(v.id, v.body),
			onSuccess: (res) => res.success && refresh(),
		}),
		remove: useMutation({ mutationFn: networkApi.deleteEntry, onSuccess: (res) => res.success && refresh() }),
	};
}

export function useImportConfig() {
	const refresh = useRefreshNetwork();

	return useMutation({
		mutationFn: (body: ImportBody) => networkApi.importConfig(body),
		onSuccess: (res, body) => res.success && body.apply && refresh(),
	});
}

export function useSyncActions() {
	const refresh = useRefreshNetwork();

	return {
		all: useMutation({ mutationFn: () => networkApi.syncAll(), onSuccess: (res) => res.success && refresh() }),
		router: useMutation({
			mutationFn: (body: SyncBody) => networkApi.syncRouter(body),
			onSuccess: (res, body) => res.success && !body.dryRun && refresh(),
		}),
	};
}
