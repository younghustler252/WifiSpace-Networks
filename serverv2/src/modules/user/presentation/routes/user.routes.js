// src/modules/user/presentation/routes/user.routes.js
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

	// -----------------------------
	// SELF ROUTES
	// -----------------------------
	router.get(
		"/me",
		authMiddleware({ userRepository }),
		asyncHandler(selfController.getProfile)
	);

	router.put(
		"/me",
		authMiddleware({ userRepository }),
		asyncHandler(selfController.updateProfile)
	);

	router.post(
		"/me/change-password",
		authMiddleware({ userRepository }),
		asyncHandler(selfController.changePassword)
	);

	router.post(
		"/me/avatar",
		authMiddleware({ userRepository }), 
		upload.single("avatar"),             
		asyncHandler(selfController.uploadAvatar)
	);

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------
	router.post(
		"/admin/create",
		authMiddleware({ userRepository }, ["superadmin"]),
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		asyncHandler(adminController.createUser)
	);

	// -----------------------------
	// GET ALL USERS
	// -----------------------------
	router.get(
		"/admin/users",
		authMiddleware({ userRepository }),
		requirePermission(PERMISSION.USER.READ, permissionService),
		asyncHandler(adminController.getAllUsers)
	);

	// -----------------------------
	// GET USER BY ID
	// -----------------------------
	router.get(
		"/admin/users/:id",
		authMiddleware({ userRepository }),
		requirePermission(PERMISSION.USER.READ, permissionService),
		asyncHandler(adminController.getUserById)
	);

	router.put(
		"/admin/update-role",
		authMiddleware({ userRepository }, ["superadmin"]),
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		asyncHandler(adminController.updateRole)
	);

	router.put(
		"/admin/:userId",
		authMiddleware({ userRepository }, ["superadmin","staff"]),
		requirePermission(PERMISSION.USER.UPDATE, permissionService),
		asyncHandler(adminController.updateUserProfile)
	);

	router.delete(
		"/admin/:userId",
		authMiddleware({ userRepository }, ["superadmin"]),
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		asyncHandler(adminController.deleteUser)
	);

	router.put(
		"/admin/ban/:userId",
		authMiddleware({ userRepository }, ["superadmin"]),
		requirePermission(PERMISSION.USER.FULL_ACCESS, permissionService),
		asyncHandler(adminController.banUser)
	);

	return router;
}