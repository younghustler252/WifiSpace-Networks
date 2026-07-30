import type { PaginatedResponse } from "@/lib/api/types";

// =========================================
// Plans
// =========================================

export interface HotspotPlan {
	id: string;
	name: string;
	price: number;
	speedRate: string;
	durationValue: number;
	durationUnit: "minutes" | "hours" | "days" | "months";
	features?: string[];
}

export type HotspotPlansResponse = PaginatedResponse<HotspotPlan>;

// =========================================
// User
// =========================================

export interface HotspotUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
}

// =========================================
// Account
// =========================================

export interface HotspotAccount {
	id: string;
	wsnId: string;
	serviceType: "hotspot";
	routerProfile?: string;
}

// =========================================
// Subscription
// =========================================

export interface HotspotSubscription {
	id: string;
	status: string;
	startsAt: string;
	expiresAt: string;
}

// =========================================
// Plan Snapshot
// =========================================

export interface HotspotPlanSnapshot {
	id: string;
	name: string;
	price: number;
	durationValue: number;
	durationUnit: string;
	speedRate?: string;
}

// =========================================
// Trusted Device
// =========================================

export interface HotspotIdentity {
	id: string;
	macAddress: string;
	status: "pending" | "authenticated" | "expired" | "revoked";
	trusted: boolean;
	lastSeenAt?: string;
}

// =========================================
// Session
// =========================================

export interface HotspotSession {
	user: HotspotUser | null;
	account: HotspotAccount | null;
	subscription: HotspotSubscription | null;
	plan: HotspotPlanSnapshot | null;
	identity: HotspotIdentity | null;

	hasUser: boolean;
	hasHotspotAccount: boolean;
	hasActiveSubscription: boolean;

	trustedDevice: boolean;
	requiresLogin: boolean;
	needsIdentity: boolean;

	accountStatus: string | null;
}

// =========================================
// Purchase
// =========================================

export interface StartHotspotPurchaseDto {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;

	planId: string;

	routerId?: string;
	routerUid?: string;
	identity?: string;

	macAddress: string;
	ipAddress: string;
	userAgent?: string;
}

// Matches paystack.gateway.js's initializeTransaction() return shape — the
// raw Paystack API response body, unwrapped one level.
export interface PaystackInitResponse {
	status: boolean;
	message: string;
	data: {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
}

// =========================================
// Purchase Response
// =========================================

export interface StartHotspotPurchaseResponse {
	status: "READY" | "CREATED_ACCOUNT" | "EXISTING_USER";

	message?: string;
	requiresLogin?: boolean;

	user: HotspotUser;

	account?: HotspotAccount;

	router?: {
		id: string;
		code: string;
		identity: string;
	};

	payment?: {
		payment: unknown;
		gatewayResponse: PaystackInitResponse;
	};
}

// =========================================
// Confirm Payment
// =========================================

export interface ConfirmHotspotDto {
	reference: string;
}

export interface ConfirmHotspotResponse {
	success: boolean;
	autoConnected: boolean;
	alreadyProcessed: boolean;
	payment: unknown;
	result?: {
		success: boolean;
		autoConnected: boolean;
		account: HotspotAccount;
		subscription: HotspotSubscription;
		activation: unknown;
	};
}

// =========================================
// Authenticate
// =========================================

export interface AuthenticateHotspotDto {
	email: string;
	password: string;

	macAddress: string;
	ipAddress: string;

	userAgent?: string;
	routerId?: string;
	routerUid?: string; // NEW — matches AuthenticateHotspotSession's resolution fields
	identity?: string;  // NEW
}

export interface AuthenticateHotspotResponse {
	id: string;
	userId: string;
	accountId: string;

	status: string;
	trustedDevice: boolean;

	lastSeenAt: string;
}

// =========================================
// Revoke / Logout
// =========================================

// NEW — the route (POST /hotspot/logout) and controller method
// (revokeSession) already exist on the backend, but there was no
// corresponding type or hook on the frontend yet.
export interface RevokeHotspotSessionDto {
	token: string;
}

export interface RevokeHotspotSessionResponse {
	success: boolean;
}