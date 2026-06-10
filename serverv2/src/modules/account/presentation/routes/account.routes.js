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

	// Auth factory
	const auth = authMiddleware({ userRepository });

	// -----------------------------
	// USER / SELF ROUTES
	// -----------------------------
	router.get(
		"/self",
		auth(),
		asyncHandler(userAccountController.getUserAccounts)
	);

	router.post(
		"/self/request",
		auth(),
		asyncHandler(userAccountController.requestAccount)
	);

	router.put(
		"/self/:accountId",
		auth(),
		asyncHandler(userAccountController.updateUserAccount)
	);

	// -----------------------------
	// SHARED ROUTES (optional but recommended)
	// -----------------------------
	router.get(
		"/:accountId",
		auth(),
		asyncHandler(sharedAccountController.getAccountById)
	);

	router.get(
		"/wsn/:wsn",
		auth(),
		asyncHandler(sharedAccountController.getAccountByWsnId)
	);

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------

	// create
	router.post(
		"/admin/create",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.CREATE, permissionService),
		asyncHandler(adminAccountController.createAccount)
	);

	// list all accounts (MISSING BEFORE)
	router.get(
		"/admin/all",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.READ, permissionService),
		asyncHandler(adminAccountController.getAllAccounts)
	);

	// update
	router.put(
		"/admin/:accountId",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.UPDATE, permissionService),
		asyncHandler(adminAccountController.updateAccount)
	);

	// delete
	router.delete(
		"/admin/:accountId",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.DELETE, permissionService),
		asyncHandler(adminAccountController.deleteAccount)
	);

	// activate (MISSING BEFORE)
	router.patch(
		"/admin/:accountId/activate",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.UPDATE, permissionService),
		asyncHandler(adminAccountController.activateAccount)
	);

	// suspend (MISSING BEFORE)
	router.patch(
		"/admin/:accountId/suspend",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.UPDATE, permissionService),
		asyncHandler(adminAccountController.suspendAccount)
	);

	// transfer (MISSING BEFORE)
	router.patch(
		"/admin/:accountId/transfer",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.ACCOUNT.UPDATE, permissionService),
		asyncHandler(adminAccountController.transferAccount)
	);

	router.patch(
		"/admin/:accountId/router-password",
		auth(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.ACCOUNT.UPDATE,
			permissionService
		),
		asyncHandler(
			adminAccountController.changeAccountPassword
		)
	);

	return router;
}