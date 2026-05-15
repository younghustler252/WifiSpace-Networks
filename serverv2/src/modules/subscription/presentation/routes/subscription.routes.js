// subscription/presentation/routes/subscription.routes.js

import { Router } from "express";
import asyncHandler from "express-async-handler";

import { PERMISSION } from "../../../../shared/constants/permissions.js";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";

import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function subscriptionRoutes({
	subscriptionController,
	subscriptionAdminController,
	permissionService,
	userRepository
}) {

	const router = Router();

	// ------------------------------------------------
	// AUTH HELPER
	// ------------------------------------------------
	const auth = (roles = []) =>
		authMiddleware(
			{ userRepository },
			roles
		);

	// =================================================
	// ACCOUNT / USER ROUTES
	// =================================================

	// ------------------------------------------------
	// CREATE SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/",

		auth(),

		asyncHandler(
			subscriptionController
				.createSubscription
		)
	);

	// ------------------------------------------------
	// RENEW SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/:subscriptionId/renew",

		auth(),

		asyncHandler(
			subscriptionController
				.renewSubscription
		)
	);

	// ------------------------------------------------
	// UPGRADE SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/:subscriptionId/upgrade",

		auth(),

		asyncHandler(
			subscriptionController
				.upgradeSubscription
		)
	);

	// ------------------------------------------------
	// GET SINGLE SUBSCRIPTION
	// ------------------------------------------------
	router.get(
		"/:subscriptionId",

		auth(),

		asyncHandler(
			subscriptionController
				.getSubscription
		)
	);

	// ------------------------------------------------
	// GET ACCOUNT SUBSCRIPTIONS
	// ------------------------------------------------
	router.get(
		"/account/:accountId",

		auth(),

		asyncHandler(
			subscriptionController
				.getAccountSubscriptions
		)
	);

	// ------------------------------------------------
	// GET CURRENT SUBSCRIPTION
	// ------------------------------------------------
	router.get(
		"/account/:accountId/current",

		auth(),

		asyncHandler(
			subscriptionController
				.getCurrentSubscription
		)
	);

	// ------------------------------------------------
	// GET USER SUBSCRIPTIONS
	// ------------------------------------------------
	router.get(
		"/user/:userId",

		auth(),

		asyncHandler(
			subscriptionController
				.getUserSubscriptions
		)
	);

	// =================================================
	// ADMIN ROUTES
	// =================================================

	// ------------------------------------------------
	// GET ALL SUBSCRIPTIONS
	// ------------------------------------------------
	router.get(
		"/admin/all",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.VIEW,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.getAllSubscriptions
		)
	);

	// ------------------------------------------------
	// ADMIN CREATE SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/create",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.CREATE,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.createSubscription
		)
	);

	// ------------------------------------------------
	// SUSPEND SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/:subscriptionId/suspend",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.SUSPEND,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.suspendSubscription
		)
	);

	// ------------------------------------------------
	// RESUME SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/:subscriptionId/resume",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.RESUME,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.resumeSubscription
		)
	);

	// ------------------------------------------------
	// CANCEL SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/:subscriptionId/cancel",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.CANCEL,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.cancelSubscription
		)
	);

	// ------------------------------------------------
	// EXTEND SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/:subscriptionId/extend",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.UPDATE,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.extendSubscription
		)
	);

	// ------------------------------------------------
	// FORCE EXPIRE SUBSCRIPTION
	// ------------------------------------------------
	router.post(
		"/admin/:subscriptionId/force-expire",

		auth([
			"staff",
			"superadmin"
		]),

		requirePermission(
			PERMISSION.SUBSCRIPTION.EXPIRE,
			permissionService
		),

		asyncHandler(
			subscriptionAdminController
				.forceExpireSubscription
		)
	);

	return router;
}