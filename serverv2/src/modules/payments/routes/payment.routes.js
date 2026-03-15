// routes/payment.routes.js
import { Router } from "express";

import PERMISSION from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../auth/presentation/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function paymentRoutes({
	paymentController,
	paymentAdminController,
	permissionService
}) {

	const router = Router();

	// ----------------------------
	// USER ROUTES
	// ----------------------------

	// Create payment via Paystack
	router.post(
		"/",
		authMiddleware(),
		paymentController.createPayment
	);

	// Confirm payment (Paystack callback)
	router.post(
		"/confirm",
		authMiddleware(),
		paymentController.confirmPayment
	);

	// Get my payments
	router.get(
		"/me",
		authMiddleware(),
		paymentController.getMyPayments
	);

	// ----------------------------
	// ADMIN ROUTES
	// ----------------------------

	// Admin create payment for user
	router.post(
		"/admin",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PAYMENT.CREATE,
			permissionService
		),
		paymentAdminController.createPayment
	);

	// Admin update payment status
	router.patch(
		"/admin/status",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PAYMENT.UPDATE,
			permissionService
		),
		paymentAdminController.updatePaymentStatus
	);

	// Admin get all payments (with filters)
	router.get(
		"/admin",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PAYMENT.READ,
			permissionService
		),
		paymentAdminController.getPayments
	);

	// Admin get payment by ID
	router.get(
		"/admin/:id",
		authMiddleware(["staff", "superadmin"]),
		requirePermission(
			PERMISSION.PAYMENT.READ,
			permissionService
		),
		paymentAdminController.getPaymentById
	);

	return router;
}