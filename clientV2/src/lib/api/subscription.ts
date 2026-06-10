import { API } from "./client";
import { ApiResponse } from "./types";

// ======================================
// TYPES
// ======================================

export type SubscriptionStatus =
	| "pending"
	| "active"
	| "suspended"
	| "expired"
	| "canceled";

export type RenewalStrategy =
	| "manual"
	| "auto_renew"
	| "invoice";

export type MikrotikSyncStatus =
	| "pending"
	| "synced"
	| "failed";

// ======================================
// SUBSCRIPTION
// ======================================

export interface Subscription {
	id: string;

	accountId: string;

	userId: string;

	planId: string;

	// ----------------------------------
	// STATUS
	// ----------------------------------

	status: SubscriptionStatus;

	// ----------------------------------
	// PLAN SNAPSHOT
	// ----------------------------------

	planSnapshot: {
		name: string;

		serviceType:
			| "pppoe"
			| "hotspot";

		price: number;

		durationValue: number;

		durationUnit:
			| "minutes"
			| "hours"
			| "days"
			| "months";

		speedRate?: string;

		mikrotikProfile?: string;

		devicesAllowed?: number;

		gracePeriodDays?: number;
	};

	// ----------------------------------
	// BILLING
	// ----------------------------------

	cycles: number;

	totalAmount: number;

	// ----------------------------------
	// DATES
	// ----------------------------------

	startsAt?: string;

	expiresAt: string;

	graceEndsAt?: string;

	activatedAt?: string;

	expiredAt?: string;

	currentPeriodStart?: string;

	currentPeriodEnd?: string;

	// ----------------------------------
	// RENEWAL
	// ----------------------------------

	renewalStrategy: RenewalStrategy;

	autoRenewEnabled: boolean;

	nextRenewalDate?: string;

	lastRenewedAt?: string;

	// ----------------------------------
	// PAYMENTS
	// ----------------------------------

	lastPaymentId?: string;

	lastPaymentDate?: string;

	lastPaymentAmount?: number;

	// ----------------------------------
	// SUSPENSION
	// ----------------------------------

	suspendedAt?: string;

	totalSuspendedDuration: number;

	suspensionReason?: string;

	// ----------------------------------
	// CANCELLATION
	// ----------------------------------

	canceledAt?: string;

	cancellationReason?: string;

	// ----------------------------------
	// ADJUSTMENTS
	// ----------------------------------

	bonusDays: number;

	manualAdjustmentDays: number;

	// ----------------------------------
	// MIKROTIK
	// ----------------------------------

	mikrotikStatus: MikrotikSyncStatus;

	mikrotikLastSyncAt?: string;

	mikrotikError?: string;

	// ----------------------------------
	// EVENTS
	// ----------------------------------

	events: {
		type:
			| "created"
			| "activated"
			| "renewed"
			| "suspended"
			| "resumed"
			| "expired"
			| "canceled"
			| "manual_adjustment";

		date: string;

		metadata?: Record<
			string,
			any
		>;
	}[];

	// ----------------------------------
	// TIMESTAMPS
	// ----------------------------------

	createdAt: string;

	updatedAt: string;
}

// ======================================
// REQUEST TYPES
// ======================================

export interface CreateSubscriptionDto {
	accountId: string;

	planId: string;

	cycles?: number;

	autoRenewEnabled?: boolean;

	renewalStrategy?: RenewalStrategy;
}

// --------------------------------------
// ADMIN CREATE
// --------------------------------------

export interface AdminCreateSubscriptionDto {
	accountId: string;

	planId: string;

	status?: SubscriptionStatus;

	cycles?: number;

	overrideExisting?: boolean;

	startsAt?: string;

	manualAdjustmentDays?: number;

	bonusDays?: number;

	autoRenewEnabled?: boolean;

	renewalStrategy?: RenewalStrategy;

	gracePeriodDays?: number;

	reason?: string;
}

// --------------------------------------
// RENEW
// --------------------------------------

export interface RenewSubscriptionDto {
	cycles?: number;
}

// --------------------------------------
// UPGRADE
// --------------------------------------

export interface UpgradeSubscriptionDto {
	planId: string;

	cycles?: number;
}

// --------------------------------------
// EXTEND
// --------------------------------------

export interface ExtendSubscriptionDto {
	days: number;

	reason?: string;
}

// --------------------------------------
// COMMON ACTION
// --------------------------------------

export interface SubscriptionActionDto {
	reason?: string;
}

// ======================================
// API
// ======================================

export const subscriptionApi = {

	// ==================================
	// USER ROUTES
	// ==================================

	create: (
		data: CreateSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			"/subscriptions",
			data
		),

	renew: (
		subscriptionId: string,

		data?: RenewSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/${subscriptionId}/renew`,
			data
		),

	upgrade: (
		subscriptionId: string,

		data: UpgradeSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/${subscriptionId}/upgrade`,
			data
		),

	getById: (
		subscriptionId: string
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.get(
			`/subscriptions/${subscriptionId}`
		),

	getAccountSubscriptions: (
		accountId: string
	): Promise<
		ApiResponse<Subscription[]>
	> =>
		API.get(
			`/subscriptions/account/${accountId}`
		),

	getCurrentSubscription: (
		accountId: string
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.get(
			`/subscriptions/account/${accountId}/current`
		),

	getUserSubscriptions: (
		userId: string
	): Promise<
		ApiResponse<Subscription[]>
	> =>
		API.get(
			`/subscriptions/user/${userId}`
		),

	// ==================================
	// ADMIN ROUTES
	// ==================================

	getAll: (params?: {
		page?: number;

		limit?: number;

		accountId?: string;

		userId?: string;

		status?: SubscriptionStatus;

		renewalStrategy?: RenewalStrategy;

		mikrotikStatus?: MikrotikSyncStatus;
	}): Promise<
		ApiResponse<{
			data: Subscription[];

			meta: {
				total: number;

				page: number;

				limit: number;

				pages: number;
			};
		}>
	> =>
		API.get(
			"/subscriptions/admin/all",
			{ params }
		),

	// ----------------------------------
	// ADMIN CREATE
	// ----------------------------------

	adminCreate: (
		data: AdminCreateSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			"/subscriptions/admin/create",
			data
		),

	// ----------------------------------
	// SUSPEND
	// ----------------------------------

	suspend: (
		subscriptionId: string,

		data?: SubscriptionActionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/admin/${subscriptionId}/suspend`,
			data
		),

	// ----------------------------------
	// RESUME
	// ----------------------------------

	resume: (
		subscriptionId: string
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/admin/${subscriptionId}/resume`
		),

	// ----------------------------------
	// CANCEL
	// ----------------------------------

	cancel: (
		subscriptionId: string,

		data?: SubscriptionActionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/admin/${subscriptionId}/cancel`,
			data
		),

	// ----------------------------------
	// EXTEND
	// ----------------------------------

	extend: (
		subscriptionId: string,

		data: ExtendSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/admin/${subscriptionId}/extend`,
			data
		),

	// ----------------------------------
	// FORCE EXPIRE
	// ----------------------------------

	forceExpire: (
		subscriptionId: string,

		data?: SubscriptionActionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			`/subscriptions/admin/${subscriptionId}/force-expire`,
			data
		)
};