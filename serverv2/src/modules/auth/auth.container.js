import { asClass } from "awilix";

// Usecases
import { RegisterUser } from "./usecases/register.usecase.js";
import { LoginUser } from "./usecases/login.usecase.js";
import { LogoutUser } from "./usecases/logout.usecase.js";
import { ResendOtp } from "./usecases/resend-otp.usecase.js";
import { VerifyOtp } from "./usecases/verify-otp.usecase.js";
import { RefreshToken } from "./usecases/refresh-token.usecase.js";

// Controller
import { AuthController } from "./presentation/controllers/auth.controller.js";

export function registerAuth(container) {
  container.register({
    // Use Cases
    registerUser: asClass(RegisterUser).scoped(),
    loginUser: asClass(LoginUser).scoped(),
    logoutUser: asClass(LogoutUser).scoped(),
    resendOtp: asClass(ResendOtp).scoped(),
    verifyOtp: asClass(VerifyOtp).scoped(),
    refreshTokenUseCase: asClass(RefreshToken).scoped(),

    // Controller
    authController: asClass(AuthController).scoped(),
  });
}