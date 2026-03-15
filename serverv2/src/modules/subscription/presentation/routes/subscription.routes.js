// subscription/presentation/routes/subscription.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";

import PERMISSION from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../auth/presentation/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function subscriptionRoutes({
	subscriptionController,
	subscriptionAdminController,
	permissionService
}) {
	const router = Router();

	// -----------------------------
	// ACCOUNT / USER ROUTES
	// -----------------------------

	// Create subscription
	router.post(
		"/",
		authMiddleware(),
		asyncHandler(subscriptionController.createSubscription)
	);

	// Renew subscription
	router.post(
		"/:subscriptionId/renew",
		authMiddleware(),
		asyncHandler(subscriptionController.renewSubscription)
	);

	// Upgrade subscription
	router.post(
		"/:subscriptionId/upgrade",
		authMiddleware(),
		asyncHandler(subscriptionController.upgradeSubscription)
	);

	// Get subscription by ID
	router.get(
		"/:subscriptionId",
		authMiddleware(),
		asyncHandler(subscriptionController.getSubscription)
	);

	// Get all subscriptions for an account
	router.get(
		"/account/:accountId",
		authMiddleware(),
		asyncHandler(subscriptionController.getAccountSubscriptions)
	);

	// Get active subscription for an account
	router.get(
		"/account/:accountId/active",
		authMiddleware(),
		asyncHandler(subscriptionController.getActiveSubscription)
	);

	// Get subscriptions for a user
	router.get(
		"/user/:userId",
		authMiddleware(),
		asyncHandler(subscriptionController.getUserSubscriptions)
	);

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------

	// Get all subscriptions (with pagination + filters)
	router.get(
		"/admin/all",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.VIEW, permissionService),
		asyncHandler(subscriptionAdminController.getAllSubscriptions)
	);

	// Suspend a subscription
	router.post(
		"/admin/:subscriptionId/suspend",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.SUSPEND, permissionService),
		asyncHandler(subscriptionAdminController.suspendSubscription)
	);

	// Resume a subscription
	router.post(
		"/admin/:subscriptionId/resume",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.RESUME, permissionService),
		asyncHandler(subscriptionAdminController.resumeSubscription)
	);

	// Cancel a subscription
	router.post(
		"/admin/:subscriptionId/cancel",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.CANCEL, permissionService),
		asyncHandler(subscriptionAdminController.cancelSubscription)
	);

	return router;
}