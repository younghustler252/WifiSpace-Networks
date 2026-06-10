import { Router } from "express";
import asyncHandler from "express-async-handler";

import { PERMISSION } from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function routerRoutes({
	routerController,
	permissionService,
	userRepository
}) {
	const router = Router();

	const auth = authMiddleware({ userRepository });

	// ==================================================
	// DEVICE / HARDWARE ACTIONS
	// ==================================================

	router.get(
		"/:id/status",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
		asyncHandler((req, res, next) =>
			routerController.checkStatus(req, res, next)
		)
	);

	router.post(
		"/:id/reboot",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ROUTER.REBOOT, permissionService),
		asyncHandler((req, res, next) =>
			routerController.reboot(req, res, next)
		)
	);
	
	// ==================================================
	// ACCOUNT / SUBSCRIPTION OPERATIONS
	// ==================================================

	router.post(
		"/account/create",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ROUTER.PROVISION, permissionService),
		asyncHandler((req, res, next) =>
			routerController.createAccount(req, res, next)
		)
	);

	router.post(
		"/subscription/provision",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ROUTER.PROVISION, permissionService),
		asyncHandler((req, res, next) =>
			routerController.provisionSubscription(req, res, next)
		)
	);

	router.post(
		"/account/suspend",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.SUSPEND, permissionService),
		asyncHandler((req, res, next) =>
			routerController.suspend(req, res, next)
		)
	);

	router.post(
		"/account/resume",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ROUTER.RESUME, permissionService),
		asyncHandler((req, res, next) =>
			routerController.resume(req, res, next)
		)
	);
	router.get(
		"/:id/profiles",
		auth(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.ROUTER.VIEW,
			permissionService
		),
		asyncHandler((req, res, next) =>
			routerController.getProfiles(req, res, next)
		)
	);

	// ==================================================
	// ADMIN ROUTER MANAGEMENT (CRUD)
	// ==================================================

	router.post(
		"/admin",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.CREATE, permissionService),
		asyncHandler((req, res, next) =>
			routerController.create(req, res, next)
		)
	);

	router.post(
		"/admin/:id/sync",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.UPDATE, permissionService),
		asyncHandler((req, res, next) =>
			routerController.sync(req, res, next)
		)
	);
	router.get(
		"/admin",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
		asyncHandler((req, res, next) =>
			routerController.list(req, res, next)
		)
	);

	router.put(
		"/admin/:id",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.UPDATE, permissionService),
		asyncHandler((req, res, next) =>
			routerController.update(req, res, next)
		)
	);

	router.delete(
		"/admin/:id",
		auth(["superadmin"]),
		requirePermission(PERMISSION.ROUTER.DELETE, permissionService),
		asyncHandler((req, res, next) =>
			routerController.delete(req, res, next)
		)
	);

	return router;
}