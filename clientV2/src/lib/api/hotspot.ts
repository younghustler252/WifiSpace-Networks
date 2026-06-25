import { API } from "./client";
import { ApiResponse } from "./types";

// ================================
// TYPES
// ================================

export interface HotspotPlan {
    id:            string;
    name:          string;
    price:         number;
    speedRate:     string;
    durationValue: number;
    durationUnit:  "minutes" | "hours" | "days" | "months";
    features?:     string[];
}

export type HotspotUIState =
    | "LOADING"
    | "NEW_USER"
    | "SELECT_PLAN"
    | "ACCOUNT_SELECTION"
    | "READY"
    | "ERROR";

export interface HotspotSession {
    state: HotspotUIState;
    hasHotspotAccount: boolean;
    user: {
        id: string;
        firstName: string;
        email: string;
        phone: string;
    } | null;

    accounts: HotspotAccount[];

    message?: string;
}

export interface HotspotAccount {
	id: string;

	wsnId: string;

	routerProfile: string;

	profileStatus: string;

	serviceType: string;

	subscription: {
		id: string;
		status: string;
		expiresAt: string;
	} | null;

	plan: {
		id: string;
		name: string;
		price: number;
		durationValue: number;
		durationUnit: string;
	} | null;
}


export interface StartHotspotPurchaseDto {
    firstName: string;
    email:     string;
    phone:     string;

    planId:     string;

    routerId?:  string;
    routerUid?: string;
    identity?:  string;

    macAddress: string;
    ipAddress:  string;    // ← was missing, needed for auto-login

    userAgent?: string;
}

export interface StartHotspotPurchaseResponse {
    user: any;
    payment: {
        payment:  any;
        paystack: any;
    };
}

export interface ConfirmHotspotDto {
    reference: string;
}

export interface ConfirmHotspotResponse {
    payment:       any;
    autoConnected: boolean;   // true = HTTP login worked, false = needs reconnect
}

export interface HotspotPlanResponse {
    data: HotspotPlan[];
}

// ================================
// API
// ================================

export const hotspotApi = {

    // GET /hotspot/plans
    getPlans: (): Promise<ApiResponse<HotspotPlanResponse>> =>
        API.get("/hotspot/plans"),

    // GET /hotspot/session?macAddress=XX:XX:XX
    // Returns null data if MAC is unknown (new user)
    getSession: (params: {
        macAddress?: string;
        email?: string;
    }): Promise<ApiResponse<HotspotSession>> =>
        API.get(
            `/hotspot/session?macAddress=${encodeURIComponent(params.macAddress || "")}&email=${encodeURIComponent(params.email || "")}`
        ),
    // POST /hotspot/purchase
    startPurchase: (
    data: StartHotspotPurchaseDto
) => {
    // console.log("PURCHASE BODY", data);

    return API.post(
        "/hotspot/purchase",
        data
    );
},
        

    // POST /hotspot/confirm
    confirmPurchase: (
        data: ConfirmHotspotDto
    ): Promise<ApiResponse<ConfirmHotspotResponse>> =>
        API.post("/hotspot/confirm", data),
};