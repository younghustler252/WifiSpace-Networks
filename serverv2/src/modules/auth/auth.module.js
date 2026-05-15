// src/modules/auth/auth.module.js

import { UserRepositoryMongo } from "../user/infrastructure/repositories/user.repository.mongo.js";
import { AuditRepositoryMongo } from "../audit/infrastructure/repositories/audit.repository.mongo.js";

import { PasswordService } from "../../shared/services/password.service.js";
import { TokenService } from "../../shared/services/token.service.js";
import { AuditService } from "../../shared/services/audit.service.js";
import { MailService } from "../../shared/mail/services/mail.service.js";
// Usecases
import { RegisterUser } from "./usecases/register.usecase.js";
import { LoginUser } from "./usecases/login.usecase.js";
import { LogoutUser } from "./usecases/logout.usecase.js";
import { ResendOtp } from "./usecases/resend-otp.usecase.js";
import { RefreshToken } from "./usecases/refresh-token.usecase.js";
import { VerifyOtp } from "./usecases/verify-otp.usecase.js";

// Controller
import { AuthController } from "./presentation/controllers/auth.controller.js";

// Routes
import authRoutes from "./presentation/routes/auth.routes.js";


export function authModule({
	jwtSecret,
	jwtRefreshSecret,
	permissionService
}) {

	/*
	|--------------------------------------------------------------------------
	| Repositories
	|--------------------------------------------------------------------------
	*/

	const userRepository = new UserRepositoryMongo();


	/*
	|--------------------------------------------------------------------------
	| Services
	|--------------------------------------------------------------------------
	*/

	const passwordService = new PasswordService();

	const tokenService = new TokenService({
		secret: jwtSecret,
		refreshSecret: jwtRefreshSecret
	});
	const auditRepository = new AuditRepositoryMongo();


	const auditService = new AuditService(auditRepository);

	const mailService = new MailService();


	/*
	|--------------------------------------------------------------------------
	| UseCases
	|--------------------------------------------------------------------------
	*/

	const usecases = {

		registerUser: new RegisterUser(
			userRepository,
			passwordService,
			auditService,
			mailService,
			tokenService
		),

		loginUser: new LoginUser(
			userRepository,
			passwordService,
			tokenService,
			auditService
		),

		logoutUser: new LogoutUser(
			tokenService,
			auditService
		),

		resendOtp: new ResendOtp(
			userRepository,
			mailService,
			passwordService
		),
		verifyOtp: new VerifyOtp(
			userRepository,
			auditService,
			tokenService,
			passwordService
		),
		refreshTokenUseCase: new RefreshToken(
			userRepository,
			tokenService,
			auditService
		),
	};


	/*
	|--------------------------------------------------------------------------
	| Controllers
	|--------------------------------------------------------------------------
	*/

	const authController = new AuthController(usecases);

  	// console.log("Controller keys:", Object.keys(authController));


	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	const routes = authRoutes({
		authController,
		permissionService
	});


	return { routes };
}