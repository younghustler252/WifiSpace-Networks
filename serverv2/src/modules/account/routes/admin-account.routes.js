import { Router } from "express";

import { authMiddleware } from "../../../infrastructure/middleware/auth.middleware.js";

export default function adminAccountRoutes({
	adminAccountController,
	userRepository
}) {
	const router = Router();

	const auth = authMiddleware({ userRepository });

	router.post(
		"/",
		auth(),
		adminAccountController.create
	);

	router.get(
		"/",
		auth(),
		adminAccountController.getAll
	);

	router.get(
		"/stats",
		auth(),
		adminAccountController.stats
	);

	router.get(
		"/:accountId",
		auth(),
		adminAccountController.getOne
	);

	router.patch(
		"/:accountId/approve",
		auth(),
		adminAccountController.approve
	);

	router.patch(
		"/:accountId/reject",
		auth(),
		adminAccountController.reject
	);

	router.patch(
		"/:accountId/suspend",
		auth(),
		adminAccountController.suspend
	);

	router.patch(
		"/:accountId/transfer",
		auth(),
		adminAccountController.transfer
	);

	router.put(
		"/:accountId",
		auth(),
		adminAccountController.update
	);

	router.patch(
		"/:accountId/router-password",
		auth(),
		adminAccountController.changeRouterPassword
	);

	router.delete(
		"/:accountId",
		auth(),
		adminAccountController.remove
	);

	return router;
}