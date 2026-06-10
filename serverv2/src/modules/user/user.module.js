// src/modules/user/user.module.js

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/
import userRoutes from "./presentation/routes/user.routes.js";

/*
|--------------------------------------------------------------------------
| MODULE FACTORY
|--------------------------------------------------------------------------
*/
export function userModule({
	selfController,
	staffController,
	adminController,
	permissionService,
	userRepository
}) {

	const routes = userRoutes({
		selfController,
		staffController,
		adminController,
		permissionService,
		userRepository
	});

	return { routes };
}