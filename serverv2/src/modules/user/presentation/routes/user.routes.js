import { Router } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";
import { PERMISSION } from "../../../../shared/constants/permissions.js";

const upload = multer({ dest: "tmp/" });

export default function userRoutes({
	selfController,
	adminController,
	userRepository,
	permissionService
}) {
	const router = Router();

	// --------------------------------------------------
	// AUTH (create once)
	// --------------------------------------------------
	const auth = authMiddleware({ userRepository });

	// role helpers
	const superAdmin = auth(["superadmin"]);
	const staffOrSuperAdmin = auth(["staff", "superadmin"]);

	// ==================================================
	// SELF ROUTES
	// ==================================================

	router.get("/me", auth(), selfController.getProfile);

	router.put("/me", auth(), selfController.updateProfile);

	router.post("/me/change-password", auth(), selfController.changePassword);

	router.post(
		"/me/avatar",
		auth(),
		upload.single("avatar"),
		selfController.uploadAvatar
	);

	// ==================================================
	// ADMIN ROUTES
	// ==================================================

	router.post(
		"/admin/create",
		superAdmin,
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		adminController.createUser
	);

	router.get(
		"/admin/users",
		auth(),
		requirePermission(PERMISSION.USER.READ, permissionService),
		adminController.getAllUsers
	);

	router.get(
		"/admin/users/:id",
		auth(),
		requirePermission(PERMISSION.USER.READ, permissionService),
		adminController.getUserById
	);

	router.put(
		"/admin/update-role",
		superAdmin,
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		adminController.updateRole
	);

	router.put(
		"/admin/:userId",
		staffOrSuperAdmin,
		requirePermission(PERMISSION.USER.UPDATE, permissionService),
		adminController.updateUserProfile
	);

	router.delete(
		"/admin/:userId",
		superAdmin,
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		adminController.deleteUser
	);

	router.put(
		"/admin/ban/:userId",
		superAdmin,
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		adminController.banUser
	);

	return router;
}