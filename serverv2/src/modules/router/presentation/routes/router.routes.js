import { Router } from "express";
import asyncHandler from "express-async-handler";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";
import { PERMISSION } from "../../../../shared/constants/permissions.js";

export default function routerRoutes({
	routerController,
	permissionService,
	userRepository,
}) {
	const router = Router();

	const auth = authMiddleware({
		userRepository,
	});

	// ==================================================
	// SUPERADMIN ROUTES
	// ==================================================

	// Create Router
	router.post(
		"/",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.CREATE,
		// }),
		asyncHandler(routerController.create.bind(routerController))
	);

	// List Routers
	router.get(
		"/",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.LIST,
		// }),
		asyncHandler(routerController.list.bind(routerController))
	);

	// Update Router
	router.patch(
		"/:id",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.UPDATE,
		// }),
		asyncHandler(routerController.update.bind(routerController))
	);

	// Delete Router
	router.delete(
		"/:id",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.DELETE,
		// }),
		asyncHandler(routerController.delete.bind(routerController))
	);

	// Reboot Router
	router.post(
		"/:id/reboot",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.REBOOT,
		// }),
		asyncHandler(routerController.reboot.bind(routerController))
	);

	// Sync Router
	router.post(
		"/:id/sync",
		auth(["superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.SYNC,
		// }),
		asyncHandler(routerController.sync.bind(routerController))
	);

	// ==================================================
	// STAFF + SUPERADMIN ROUTES
	// ==================================================

	// Router Status
	router.get(
		"/:id/status",
		auth(["staff", "superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.STATUS_VIEW,
		// }),
		asyncHandler(routerController.checkStatus.bind(routerController))
	);

	// Router Profiles
	router.get(
		"/:id/profiles",
		auth(["staff", "superadmin"]),
		// requirePermission({
		// 	permissionService,
		// 	permission: PERMISSION.ROUTER.PROFILE_VIEW,
		// }),
		asyncHandler(routerController.getProfiles.bind(routerController))
	);

	return router;
}