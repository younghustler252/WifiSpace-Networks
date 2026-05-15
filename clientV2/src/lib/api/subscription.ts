import { API } from "./client";
import { ApiResponse } from "./types";

// ======================================
// TYPES
// ======================================

export type SubscriptionStatus =
	| "active"
	| "grace"
	| "expired"
	| "suspended"
	| "canceled";

export type BillingCycle =
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly";

// ======================================
// SUBSCRIPTION
// ======================================

export interface Subscription {
	id: string;

	accountId: string;
	planId: string;

	planSnapshot: {
		name: string;
		price: number;
		durationDays: number;
		speedRate?: string;
		devicesAllowed?: number;
	};

	// ----------------------------------
	// Dates
	// ----------------------------------

	startDate: string;

	baseEndDate: string;

	endDate: string;

	// ----------------------------------
	// Status
	// ----------------------------------

	status: SubscriptionStatus;

	// ----------------------------------
	// Billing
	// ----------------------------------

	billingCycle: BillingCycle;

	cycles: number;

	totalAmount: number;

	// ----------------------------------
	// Adjustments
	// ----------------------------------

	bonusDays: number;

	manualAdjustmentDays: number;

	// ----------------------------------
	// Suspension
	// ----------------------------------

	suspendedAt?: string;

	totalSuspendedDuration: number;

	suspensionReason?: string;

	// ----------------------------------
	// Renewal
	// ----------------------------------

	autoRenew: boolean;

	lastRenewedAt?: string;

	nextRenewalDate?: string;

	// ----------------------------------
	// Cancellation
	// ----------------------------------

	canceledAt?: string;

	cancellationReason?: string;

	// ----------------------------------
	// Grace
	// ----------------------------------

	gracePeriodDays: number;

	gracePeriodEndsAt?: string;

	// ----------------------------------
	// Payments
	// ----------------------------------

	payments: {
		paymentId?: string;

		amount: number;

		date: string;
	}[];

	// ----------------------------------
	// Events / Audit
	// ----------------------------------

	events: {
		type:
			| "created"
			| "renewed"
			| "suspended"
			| "resumed"
			| "canceled"
			| "expired"
			| "manual_adjustment";

		date: string;

		metadata?: Record<
			string,
			any
		>;
	}[];

	// ----------------------------------
	// Router
	// ----------------------------------

	routerProfile?: string;

	// ----------------------------------
	// Timestamps
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

	autoRenew?: boolean;
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

	startDate?: string;

	manualAdjustmentDays?: number;

	bonusDays?: number;

	autoRenew?: boolean;

	gracePeriodDays?: number;

	routerProfile?: string;

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
): Promise<ApiResponse<Subscription>> =>
	API.post(
		`/subscriptions/admin/${subscriptionId}/suspend`,
		data
	),

	// ----------------------------------
	// RESUME
	// ----------------------------------

	resume: (
	subscriptionId: string
): Promise<ApiResponse<Subscription>> =>
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