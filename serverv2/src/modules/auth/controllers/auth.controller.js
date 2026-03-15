// modules/auth/controller/auth.controller.js
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ForbiddenError } from "../../../shared/errors/forbidden-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class AuthController {
	constructor({ loginUserUseCase, registerUserUseCase, refreshTokenUseCase, logoutUseCase, verifyUserUseCase }) {
		this.loginUserUseCase = loginUserUseCase;
		this.registerUserUseCase = registerUserUseCase;
		this.refreshTokenUseCase = refreshTokenUseCase;
		this.logoutUseCase = logoutUseCase;
		this.verifyUserUseCase = verifyUserUseCase;
	}

	// ----------------------------
	// POST /auth/register
	// ----------------------------
	async register(req, res, next) {
		try {
			const { firstName, lastName, email, password, role, phone } = req.body;
			const user = await this.registerUserUseCase.execute({ firstName, lastName, email, password, role, phone });
			res.status(201).json({
				status: "success",
				message: "User registered successfully. Verification email sent.",
				data: user
			});
		} catch (err) {
			next(err);
		}
	}

	// ----------------------------
	// POST /auth/login
	// ----------------------------
	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const ip = req.ip;
			const result = await this.loginUserUseCase.execute({ email, password, ip });
			res.status(200).json({
				status: "success",
				message: "Login successful",
				data: result
			});
		} catch (err) {
			next(err);
		}
	}

	// ----------------------------
	// POST /auth/refresh
	// ----------------------------
	async refreshToken(req, res, next) {
		try {
			const { refreshToken } = req.body;
			const result = await this.refreshTokenUseCase.execute({ refreshToken });
			res.status(200).json({
				status: "success",
				message: "Token refreshed",
				data: result
			});
		} catch (err) {
			next(err);
		}
	}

	// ----------------------------
	// POST /auth/logout
	// ----------------------------
	async logout(req, res, next) {
		try {
			const { token } = req.body;
			await this.logoutUseCase.execute({ token });
			res.status(200).json({
				status: "success",
				message: "Logged out successfully"
			});
		} catch (err) {
			next(err);
		}
	}

	// ----------------------------
	// GET /auth/verify?token=xxxx
	// ----------------------------
	async verifyEmail(req, res, next) {
		try {
			const { token } = req.query;
			const user = await this.verifyUserUseCase.execute({ token });
			res.status(200).json({
				status: "success",
				message: "Email verified successfully",
				data: { id: user.id, email: user.email }
			});
		} catch (err) {
			next(err);
		}
	}
}