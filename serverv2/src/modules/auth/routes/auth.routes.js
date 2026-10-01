// src/modules/auth/routes/auth.routes.js

import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import {
	registerSchema,
	loginSchema,
	verifyOtpSchema,
	resendOtpSchema,
	forgotPasswordSchema,
	resetPasswordSchema
} from "../validators/auth.validators.js";

const router = Router();

const authController = container.resolve("authController");
const authenticate = container.resolve("authenticate");

router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refreshToken));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.post("/verify-otp", validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));
router.post("/resend-otp", validate(resendOtpSchema), asyncHandler(authController.resendOtp));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

export default router;