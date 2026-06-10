// src/modules/payments/payment.module.js

import paymentRoutes from "./routes/payment.routes.js";

export function paymentModule({
	// controllers
	paymentController,
	paymentAdminController,

	// shared
	permissionService,
	userRepository
}) {

	// -----------------------------
	// ROUTES
	// -----------------------------
	const routes = paymentRoutes({
		paymentController,
		paymentAdminController,
		permissionService,
		userRepository
	});

	return { routes };
}