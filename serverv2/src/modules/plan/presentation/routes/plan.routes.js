import { Router } from "express";

import PERMISSION from "../../../../shared/constants/permissions.js";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function planRoutes({
	planController,
	permissionService
}) {

	const router = Router();

	// -----------------------------
	// AUTHENTICATED USERS
	// -----------------------------

	router.get(
		"/",
		authMiddleware(),
		planController.getAll
	);

	router.get(
		"/:id",
		authMiddleware(),
		planController.getById
	);

	// -----------------------------
	// STAFF / SUPERADMIN
	// -----------------------------

	router.post(
		"/",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PLAN.CREATE,
			permissionService
		),
		planController.create
	);

	router.patch(
		"/:id",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PLAN.UPDATE,
			permissionService
		),
		planController.update
	);

	router.delete(
		"/:id",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PLAN.DELETE,
			permissionService
		),
		planController.remove
	);

	return router;
}