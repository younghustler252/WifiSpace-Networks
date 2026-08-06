import {
	useQuery,
	useMutation
} from "@tanstack/react-query";

import { hotspotApi } from "../api/hotspot.api";

import type {
	StartHotspotPurchaseDto,
	ConfirmHotspotDto,
	AuthenticateHotspotDto,
	RevokeHotspotSessionDto
} from "../api/hotspot.types";

// ========================================
// Plans
// ========================================
export function useHotspotPlans() {
	return useQuery({
		queryKey: ["hotspot-plans"],
		queryFn: async () => {
			const res = await hotspotApi.getPlans();
			return res.data;
		}
	});
}

// ========================================
// Session
// ========================================

export function useHotspotSession(params: {
	macAddress?: string;
	email?: string;
}) {
	return useQuery({
		queryKey: ["hotspot", "session", params],
		queryFn: async () => {
			const res = await hotspotApi.getSession(params);
			return res.data;
		},
		enabled: Boolean(params.macAddress || params.email)
	});
}

// ========================================
// Purchase
// ========================================

export function useStartHotspotPurchase() {
	return useMutation({
		// CHANGED: same unwrap fix — mutationFn was returning the envelope.
		mutationFn: async (data: StartHotspotPurchaseDto) => {
			const res = await hotspotApi.startPurchase(data);
			return res.data;
		}
	});
}

// ========================================
// Confirm Payment
// ========================================

export function useConfirmHotspotPurchase() {
	return useMutation({
		mutationFn: async (data: ConfirmHotspotDto) => {
			const res = await hotspotApi.confirmPurchase(data);
			return res.data;
		}
	});
}

// ========================================
// Authenticate
// ========================================

export function useAuthenticateHotspot() {
	return useMutation({
		mutationFn: async (data: AuthenticateHotspotDto) => {
			const res = await hotspotApi.authenticate(data);
			return res.data;
		}
	});
}

// ========================================
// Revoke / Logout
// ========================================

export function useRevokeHotspotSession() {
	return useMutation({
		mutationFn: async (data: RevokeHotspotSessionDto) => {
			const res = await hotspotApi.revokeSession(data);
			return res.data;
		}
	});
}