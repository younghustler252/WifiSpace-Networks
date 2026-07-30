import { API } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

import type {
	HotspotSession,
	StartHotspotPurchaseDto,
	StartHotspotPurchaseResponse,
	ConfirmHotspotDto,
	ConfirmHotspotResponse,
	HotspotPlansResponse,
	AuthenticateHotspotDto,
	AuthenticateHotspotResponse,
	RevokeHotspotSessionDto,      // NEW
	RevokeHotspotSessionResponse  // NEW
} from "./hotspot.types";

// =========================================
// Hotspot API
// =========================================

export const hotspotApi = {

	// -------------------------------------
	// Plans
	// -------------------------------------

	getPlans(): Promise<ApiResponse<HotspotPlansResponse>> {
		return API.get("/hotspot/plans");
	},

	// -------------------------------------
	// Session
	// -------------------------------------

	getSession(params: {
		macAddress?: string;
		email?: string;
	}): Promise<ApiResponse<HotspotSession>> {

		const search = new URLSearchParams();

		if (params.macAddress) {
			search.set("macAddress", params.macAddress);
		}

		if (params.email) {
			search.set("email", params.email);
		}

		return API.get(
			`/hotspot/session?${search.toString()}`
		);
	},

	// -------------------------------------
	// Purchase
	// -------------------------------------

	startPurchase(
		data: StartHotspotPurchaseDto
	): Promise<ApiResponse<StartHotspotPurchaseResponse>> {

		return API.post(
			"/hotspot/purchase",
			data
		);
	},

	// -------------------------------------
	// Confirm Payment
	// -------------------------------------

	confirmPurchase(
		data: ConfirmHotspotDto
	): Promise<ApiResponse<ConfirmHotspotResponse>> {

		return API.post(
			"/hotspot/confirm",
			data
		);
	},

	// -------------------------------------
	// Authenticate Existing User
	// -------------------------------------

	authenticate(
		data: AuthenticateHotspotDto
	): Promise<ApiResponse<AuthenticateHotspotResponse>> {

		return API.post(
			"/hotspot/authenticate",
			data
		);
	},

	// -------------------------------------
	// Revoke / Logout
	// -------------------------------------

	// NEW — matches POST /hotspot/logout, HotspotController.revokeSession,
	// which reads req.body.token.
	revokeSession(
		data: RevokeHotspotSessionDto
	): Promise<ApiResponse<RevokeHotspotSessionResponse>> {

		return API.post(
			"/hotspot/logout",
			data
		);
	},
};