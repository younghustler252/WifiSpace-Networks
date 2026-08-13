import { Router } from "express";
import asyncHandler from "express-async-handler";

import { authMiddleware } from "../../../infrastructure/middleware/auth.middleware.js";

export default function accountRoutes({
	accountController,
	userRepository
}) {
	const router = Router();

	const auth = authMiddleware({ userRepository });

	router.post(
		"/request",
		auth(),
		asyncHandler(accountController.request)
	);

	router.get(
		"/",
		auth(),
		asyncHandler(accountController.getMyAccounts)
	);

	router.get(
		"/:accountId",
		auth(),
		asyncHandler(accountController.getMyAccount)
	);

	router.put(
		"/:accountId",
		auth(),
		asyncHandler(accountController.updateMyAccount)
	);

	return router;
}