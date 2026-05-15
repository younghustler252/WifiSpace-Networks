// account/presentation/routes/account.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { PERMISSION } from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function accountRoutes({
	adminAccountController,
	userAccountController,
	sharedAccountController,
	permissionService,
	userRepository
}) {
	const router = Router();
	
	// -----------------------------
	// USER / SELF ROUTES
	// -----------------------------
	router.get(
		"/self",
		authMiddleware({ userRepository }),
		asyncHandler(userAccountController.getUserAccounts)
	);

	router.post(
		"/self/request",
		authMiddleware({ userRepository }),
		asyncHandler(userAccountController.requestAccount)
	);

	router.put(
		"/self/:accountId",
		authMiddleware({ userRepository }),
		asyncHandler(userAccountController.updateUserAccount)
	);

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------
	router.post(
		"/admin/create",
		authMiddleware({ userRepository }),
		// requirePermission(PERMISSION.ACCOUNT.CREATE, permissionService),
		asyncHandler(adminAccountController.createAccount)
	);

	router.put(
		"/admin/:accountId",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.UPDATE, permissionService),
		asyncHandler(adminAccountController.updateAccount)
	);

	router.delete(
		"/admin/:accountId",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.DELETE, permissionService),
		asyncHandler(adminAccountController.deleteAccount)
	);

	router.post(
		"/admin/:accountId/activate",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.ACTIVATE, permissionService),
		asyncHandler(adminAccountController.activateAccount)
	);

	router.post(
		"/admin/:accountId/suspend",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.SUSPEND, permissionService),
		asyncHandler(adminAccountController.suspendAccount)
	);

	router.post(
		"/admin/:accountId/transfer",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.TRANSFER, permissionService),
		asyncHandler(adminAccountController.transferAccount)
	);

	router.get(
		"/admin/all",
		authMiddleware({ userRepository }, ["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.VIEW, permissionService),
		asyncHandler(adminAccountController.getAllAccounts)
	);

	// -----------------------------
	// SHARED ROUTES
	// -----------------------------
	router.get(
		"/:accountId",
		authMiddleware({ userRepository }),
		asyncHandler(sharedAccountController.getAccountById)
	);

	router.get(
		"/wsn/:wsn",
		authMiddleware({ userRepository }),
		asyncHandler(sharedAccountController.getAccountByWSN)
	);

	return router;
}