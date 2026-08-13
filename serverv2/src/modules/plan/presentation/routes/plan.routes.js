import { Router } from "express";

import { PERMISSION } from "../../../../shared/constants/permissions.js";

import { authMiddleware } from "../../../../infrastructure/middleware/auth.middleware.js";
import { requirePermission } from "../../../../infrastructure/middleware/permission.middleware.js";

export default function planRoutes({
	planController,
	permissionService,
	userRepository
}) {
	const router = Router();

	// --------------------------------------------------
	// AUTH (create once)
	// --------------------------------------------------
	const auth = authMiddleware({ userRepository });

	// -----------------------------
	// AUTHENTICATED USERS
	// -----------------------------

	router.get(
		"/",
		auth(),
		planController.getAll
	);

	router.get(
		"/:id",
		auth(),
		planController.getById
	);

	// -----------------------------
	// STAFF / SUPERADMIN
	// -----------------------------

	router.post(
		"/create",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PLAN.CREATE, permissionService),
		planController.create
	);

	router.patch(
		"/:id",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PLAN.UPDATE, permissionService),
		planController.update
	);

	router.delete(
		"/:id",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PLAN.DELETE, permissionService),
		planController.remove
	);

	return router;
}