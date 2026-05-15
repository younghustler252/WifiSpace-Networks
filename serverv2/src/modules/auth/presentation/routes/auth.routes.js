// src/modules/auth/presentation/routes/auth.routes.js

import { Router } from "express";
import asyncHandler from "express-async-handler";

export default function authRoutes({ authController }) {
	const router = Router();

	// -----------------------------
	// AUTH ROUTES
	// -----------------------------
	router.post(
		"/register",
		asyncHandler(authController.register)
	);

	router.post(
		"/login",
		asyncHandler(authController.login)
	);

	router.post(
		"/refresh",
		asyncHandler(authController.refreshToken)
	);

	router.post(
		"/logout",
		asyncHandler(authController.logout)
	);

	router.post(
		"/verify-otp",
		asyncHandler(authController.verifyOtp)
	);
	// console.log('refreshToken type:', typeof authController.refreshToken);
	router.post(
		"/resend-otp",
		asyncHandler(authController.resendOtp)
	);

	return router;
}