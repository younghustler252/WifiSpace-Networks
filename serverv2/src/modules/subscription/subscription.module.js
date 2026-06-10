// ======================================================
// subscription.module.js
// CLEAN AWILIX CRADLE STYLE
// ======================================================

import subscriptionRoutes from "./presentation/routes/subscription.routes.js";

export function subscriptionModule({
	subscriptionController,
	subscriptionAdminController,
	permissionService,
	userRepository
}) {

	const routes = subscriptionRoutes({
		subscriptionController,
		subscriptionAdminController,
		permissionService,
		userRepository
	});

	return { routes };
}