import { API } from "../../lib/api/client";
import { ApiResponse } from "../../lib/api/types";

import type {
  Subscription,
  SubscriptionStatus,
  RenewalStrategy,
  MikrotikSyncStatus,
  CreateSubscriptionDto,
  AdminCreateSubscriptionDto,
  RenewSubscriptionDto,
  UpgradeSubscriptionDto,
  ExtendSubscriptionDto,
  SubscriptionActionDto,
  AdminRenewSubscriptionDto,      // Added Type Import
  AdminChangePlanDto,            // Added Type Import
} from "./subscription.types";


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

		search?: string;

		accountId?: string;
		planId?: string;

		status?: SubscriptionStatus;

		autoRenewEnabled?: boolean;

		mikrotikStatus?: MikrotikSyncStatus;

		expiresFrom?: string;
		expiresTo?: string;
	}): Promise<
		ApiResponse<{
			data: Subscription[];
			meta: {
				total: number;
				page: number;
				limit: number;
				totalPages: number;
			};
		}>
	> =>
		API.get("/subscriptions/admin/all", { params }),
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
		),

	// ----------------------------------
	// ADMIN RENEW
	// ----------------------------------
	adminRenew: (
		data: AdminRenewSubscriptionDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			"/subscriptions/admin/renew",
			data
		),

	// ----------------------------------
	// ADMIN CHANGE PLAN
	// ----------------------------------
	adminChangePlan: (
		data: AdminChangePlanDto
	): Promise<
		ApiResponse<Subscription>
	> =>
		API.post(
			"/subscriptions/admin/change-plan",
			data
		),

	syncHardware: (
		subscriptionId: string
	): Promise<ApiResponse<Subscription>> =>
		API.post(
			`/admin/${subscriptionId}/sync-hardware`
		),
};
