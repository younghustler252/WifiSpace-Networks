import { Router } from "express";

import {PERMISSION} from "../../../../shared/constants/permissions.js";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function planRoutes({
	planController,
	permissionService,
	userRepository
}) {

	const router = Router();

	// -----------------------------
	// AUTHENTICATED USERS
	// -----------------------------

	router.get(
		"/",
		authMiddleware({ userRepository }),
		planController.getAll
	);

	router.get(
		"/:id",
		authMiddleware({ userRepository }),
		planController.getById
	);

	// -----------------------------
	// STAFF / SUPERADMIN
	// -----------------------------

	router.post(
		"/create",
		authMiddleware(
			{ userRepository },
			["staff", "superadmin"]
		),
		requirePermission(
			PERMISSION.PLAN.CREATE,
			permissionService
		),
		planController.create
	);

	router.patch(
		"/:id",
		authMiddleware(
			{ userRepository },
			["staff", "superadmin"]
		),
		requirePermission(
			PERMISSION.PLAN.UPDATE,
			permissionService
		),
		planController.update
	);

	router.delete(
		"/:id",
		authMiddleware(
			{ userRepository },
			["staff", "superadmin"]
		),
		requirePermission(
			PERMISSION.PLAN.DELETE,
			permissionService
		),
		planController.remove
	);

	return router;
}