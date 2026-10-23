import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";
import type { Wallet } from "@/features/wallet/types/wallet.types";

export type HotspotSessionState = "UNKNOWN_DEVICE" | "PENDING" | "TRUSTED_NEEDS_PLAN" | "ACTIVATING" | "ACTIVATION_FAILED" | "ACTIVE";

export interface HotspotSession {
	state: HotspotSessionState;
	router: HotspotRouter | null;
	session: Record<string, unknown> | null;
	subscription: Subscription | null;
	user?: { email: string; firstName?: string | null } | null;
	retried?: boolean;
	provisioning?: "synced" | "pending" | "failed" | (string & {});
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
export interface HotspotRevokeResult {
	macAddress?: string;
	status?: string;
}

export interface HotspotClientInfo {
	macAddress: string;
	ipAddress?: string;
	userAgent?: string;
	routerId?: string;
	routerUid?: string;
	routerCode?: string;
	identity?: string;
}

export interface HotspotStartBody extends HotspotClientInfo {
	email: string;
	firstName?: string;
	planId: string;
	callbackUrl?: string;
	payWith?: "gateway" | "wallet";
	password?: string;
}

export interface HotspotWalletBody {
	email: string;
	password: string;
}

export type HotspotWallet = Wallet;

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

export interface HotspotStartPaid {
	status: "PAID";
	reference: string;
	balance: number;
	provisioning?: unknown;
	plan: { id: string; name: string; price: number };
}

export type HotspotStartResult = HotspotStartExistingUser | HotspotStartPaymentRequired | HotspotStartPaid;

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

export type HotspotStage = "awaiting_payment" | "payment_failed" | "provisioning" | "provisioning_failed" | "connected";

export interface HotspotStatus {
	paymentStatus: "initiated" | "pending" | "successful" | "failed" | "expired" | (string & {});
	businessProcessed: boolean;
	connected: boolean;
	stage: HotspotStage;
	expiresAt?: string | null;
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