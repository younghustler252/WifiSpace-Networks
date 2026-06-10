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
	// AUTH (create once)
	// ------------------------------------------------
	const auth = authMiddleware({ userRepository });

	// =================================================
	// USER ROUTES
	// =================================================

	router.post(
		"/",
		auth(),
		asyncHandler(subscriptionController.createSubscription)
	);

	router.post(
		"/:subscriptionId/renew",
		auth(),
		asyncHandler(subscriptionController.renewSubscription)
	);

	router.post(
		"/:subscriptionId/upgrade",
		auth(),
		asyncHandler(subscriptionController.upgradeSubscription)
	);

	router.get(
		"/:subscriptionId",
		auth(),
		asyncHandler(subscriptionController.getSubscription)
	);

	router.get(
		"/account/:accountId",
		auth(),
		asyncHandler(subscriptionController.getAccountSubscriptions)
	);

	router.get(
		"/account/:accountId/current",
		auth(),
		asyncHandler(subscriptionController.getCurrentSubscription)
	);

	// =================================================
	// ADMIN ROUTES
	// =================================================

	router.get(
		"/admin/all",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.VIEW, permissionService),
		asyncHandler(subscriptionAdminController.getAllSubscriptions)
	);

	router.post(
		"/admin/create",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.CREATE, permissionService),
		asyncHandler(subscriptionAdminController.createSubscription)
	);

	router.post(
		"/admin/:subscriptionId/suspend",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.SUSPEND, permissionService),
		asyncHandler(subscriptionAdminController.suspendSubscription)
	);

	router.post(
		"/admin/:subscriptionId/resume",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.RESUME, permissionService),
		asyncHandler(subscriptionAdminController.resumeSubscription)
	);

	router.post(
		"/admin/:subscriptionId/cancel",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.CANCEL, permissionService),
		asyncHandler(subscriptionAdminController.cancelSubscription)
	);

	router.post(
		"/admin/:subscriptionId/extend",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.UPDATE, permissionService),
		asyncHandler(subscriptionAdminController.extendSubscription)
	);

	router.post(
		"/admin/:subscriptionId/force-expire",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.SUBSCRIPTION.EXPIRE, permissionService),
		asyncHandler(subscriptionAdminController.forceExpireSubscription)
	);

	return router;
}