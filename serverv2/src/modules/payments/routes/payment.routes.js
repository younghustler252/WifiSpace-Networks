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

	// helper (same pattern as subscription)
	const auth = (roles = []) =>
		authMiddleware({ userRepository }, roles);

	// -----------------------------
	// USER ROUTES
	// -----------------------------

	// Create payment (Paystack init)
	router.post(
		"/",
		auth(),
		asyncHandler(paymentController.createPayment)
	);
	
	router.get(
		"/all",
		auth(["customer","staff", "superadmin"]),
		asyncHandler(paymentController.getPayments)
	);
	// Confirm payment (verify Paystack)
	router.post(
		"/confirm",
		auth(),
		asyncHandler(paymentController.confirmPayment)
	);

	// Get current user's payments
	router.get(
		"/me",
		auth(),
		asyncHandler(paymentController.getMyPayments)
	);

	// Get payment by ID (owned)
	router.get(
		"/:id",
		auth(),
		asyncHandler(paymentController.getPaymentById)
	);

	router.post("/webhook/paystack",auth(), asyncHandler(paymentController.handleWebhook));

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------

	// Admin create payment
	router.post(
		"/admin",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PAYMENT.CREATE, permissionService),
		asyncHandler(paymentAdminController.createPayment)
	);
	
	// Admin update payment
	router.patch(
		"/admin/:id",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PAYMENT.UPDATE, permissionService),
		asyncHandler(paymentAdminController.updatePayment)
	);

	// Admin get all payments

	// Admin get payment by ID
	router.get(
		"/admin/:id",
		auth(["staff", "superadmin"]),
		requirePermission(PERMISSION.PAYMENT.READ, permissionService),
		asyncHandler(paymentAdminController.getPaymentById)
	);

	return router;
}