import { Router } from "express";
import asyncHandler from "express-async-handler";

import { PERMISSION } from "../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";

export default function paymentRoutes({
	paymentController,
	paymentAdminController,
	permissionService,
	userRepository
}) {
	const router = Router();

	// create once (better pattern)
	const auth = authMiddleware({ userRepository });

	// -----------------------------
	// USER ROUTES
	// -----------------------------

	router.post(
		"/",
		auth(),
		asyncHandler(paymentController.createPayment)
	);

	router.get(
		"/all",
		auth(["customer", "staff", "superadmin"]),
		asyncHandler(paymentController.getPayments)
	);

	router.post(
		"/confirm",
		auth(),
		asyncHandler(paymentController.confirmPayment)
	);

	router.get(
		"/me",
		auth(),
		asyncHandler(paymentController.getMyPayments)
	);
	router.get(
		"/resolve",
		paymentController.resolvePayment
	);
	router.post(
		"/:paymentId/reprocess",
		auth(),
		paymentController.reprocessPayment
	);

	router.get(
		"/:id",
		auth(),
		asyncHandler(paymentController.getPaymentById)
	);

	router.post(
		"/webhook/paystack",
		asyncHandler(paymentController.handleWebhook)
	);

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------

	router.post(
		"/admin/record",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PAYMENT.CREATE, permissionService),
		asyncHandler(paymentAdminController.recordPayment)
	);

	router.patch(
		"/admin/:id",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PAYMENT.UPDATE, permissionService),
		asyncHandler(paymentAdminController.updatePayment)
	);


	return router;
}