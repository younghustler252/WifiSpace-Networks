import { asClass } from "awilix";

import { RegisterUser } from "./usecases/register.usecase.js";
import { LoginUser } from "./usecases/login.usecase.js";
import { LogoutUser } from "./usecases/logout.usecase.js";
import { ResendOtp } from "./usecases/resend-otp.usecase.js";
import { VerifyOtp } from "./usecases/verify-otp.usecase.js";
import { RefreshToken } from "./usecases/refresh-token.usecase.js";
import { ForgotPassword } from "./usecases/forgot-password.usecase.js";
import { ResetPassword } from "./usecases/reset-password.usecase.js";

import { AuthController } from "./controllers/auth.controller.js";

export function registerAuth(container) {
	container.register({
		registerUser: asClass(RegisterUser).scoped(),
		loginUser: asClass(LoginUser).scoped(),
		logoutUser: asClass(LogoutUser).scoped(),
		resendOtp: asClass(ResendOtp).scoped(),
		verifyOtp: asClass(VerifyOtp).scoped(),
		refreshTokenUseCase: asClass(RefreshToken).scoped(),
		forgotPassword: asClass(ForgotPassword).scoped(),
		resetPassword: asClass(ResetPassword).scoped(),

		authController: asClass(AuthController).scoped()
	});
}