// ======================================================
// plan.module.js
// FULL AWILIX CRADLE STYLE
// ======================================================

import planRoutes from "./presentation/routes/plan.routes.js";

export function planModule({
	planController,
	permissionService,
	userRepository
}) {

	const routes = planRoutes({
		planController,
		permissionService,
		userRepository
	});

	return { routes };
}