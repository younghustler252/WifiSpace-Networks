import { AnalyticsController } from "./presentation/controllers/analytics.controller.js";
import analyticsRoutes from "./presentation/routes/analytics.routes.js";

export function analyticsModule(deps = {}) {
	const {
		// usecases (from container)
		trackAnalytics,
		getAnalytics,
		getAnalyticsSummary,

		// shared dependencies (if needed in routes)
		permissionService,
		userRepository
	} = deps;

	// -----------------------------
	// GROUP USECASES ONLY
	// -----------------------------
	const usecases = {
		trackAnalytics,
		getAnalytics,
		getAnalyticsSummary
	};

	// -----------------------------
	// CONTROLLER
	// -----------------------------
	const analyticsController = new AnalyticsController(usecases);

	// -----------------------------
	// ROUTES
	// -----------------------------
	const routes = analyticsRoutes({
		analyticsController,
		permissionService,
		userRepository
	});

	return { routes };
}