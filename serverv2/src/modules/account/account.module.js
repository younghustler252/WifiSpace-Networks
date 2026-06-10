// src/modules/account/account.module.js

import accountRoutes from "./presentation/routes/account.routes.js";

export function accountModule(cradle) {
	return {
		routes: accountRoutes(cradle)
	};
}