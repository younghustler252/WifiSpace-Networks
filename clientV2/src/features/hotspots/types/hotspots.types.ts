import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";

export type HotspotSessionState = "UNKNOWN_DEVICE" | "PENDING" | "TRUSTED_NEEDS_PLAN" | "ACTIVE";

export interface HotspotSession {
	state: HotspotSessionState;
	router: HotspotRouter | null;
	session: Record<string, unknown> | null;
	subscription: Subscription | null;
	provisioning?: unknown;
}
export interface HotspotRouter {
	id: string;
	name: string;
	code: string;
	location?: string | null;
	status?: string;
}

export interface HotspotSubscription {
	id?: string;
	status?: string;
	planSnapshot?: { name: string; price: number; durationValue: number; durationUnit: string };
	expiresAt?: string | null;
}
export interface HotspotClientInfo {
	macAddress: string;
	ipAddress?: string;
	userAgent?: string;
	routerId?: string;
	routerUid?: string;
	identity?: string;
}

export interface HotspotStartBody extends HotspotClientInfo {
	email: string;
	firstName?: string;
	planId: string;
	callbackUrl: string;
}

export interface HotspotStartExistingUser {
	status: "EXISTING_USER";
	requiresLogin: true;
	message: string;
	user: { id: string; firstName?: string; email: string };
}

export interface HotspotStartPaymentRequired {
	status: "PAYMENT_REQUIRED";
	authorizationUrl: string;
	payment: { id: string; status: string; gatewayReference: string };
	plan: { id: string; name: string; price: number };
}

export type HotspotStartResult = HotspotStartExistingUser | HotspotStartPaymentRequired;

export interface HotspotLoginBody extends HotspotClientInfo {
	email: string;
	password: string;
}

export interface HotspotLoginResult {
	session: {
		id: string;
		macAddress: string;
		status: string;
		trustedDevice: boolean;
		routerId: string;
		expiresAt: string;
	};
	account: { id: string; wsnId: string; serviceType: string; maxDevices: number };
}

export interface HotspotStatus {
	paymentStatus: "initiated" | "pending" | "successful" | "failed" | (string & {});
	businessProcessed: boolean;
	connected: boolean;
}

export interface RouterRef {
	_id: string;
	name: string;
	code: string;
	location?: string | null;
}

export interface HotspotDevice {
	id: string;
	userId: string;
	accountId: string;
	routerId: string;
	router: RouterRef | null;
	macAddress: string;
	ipAddress: string | null;
	userAgent: string | null;
	status: string;
	trustedDevice: boolean;
	lastSeenAt: string;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface HotspotLocation {
	id: string;
	accountId: string;
	subscriptionId: string | null;
	routerId: string;
	router: RouterRef | null;
	status: string;
	lastSyncedAt: string | null;
	lastError: string | null;
	createdAt: string;
	updatedAt: string;
}