import { Router } from "express";

import accountRoutes from "./routes/account.routes.js";
import adminAccountRoutes from "./routes/admin-account.routes.js";

export function accountModule(cradle) {
	const router = Router();

	router.use("/admin", adminAccountRoutes(cradle));
	router.use("/", accountRoutes(cradle));

	return {
		routes: router
	};
}