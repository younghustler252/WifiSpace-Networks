// src/modules/auth/presentation/controllers/auth.controller.js

import { successResponse } from "../../../../shared/utils/api-response.js";

export class AuthController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// -----------------------------
	// AUTH
	// -----------------------------

	register = async (req, res) => {
		const user = await this.usecases.registerUser.execute({
			...req.body,
			ip: req.ip,
			userAgent: req.headers["user-agent"]
		});

		return successResponse({
			res,
			data: user,
			message: "User registered successfully. Verification email sent."
		});
	};

	login = async (req, res) => {
		const result = await this.usecases.loginUser.execute({
			...req.body,
			ip: req.ip,
			userAgent: req.headers["user-agent"]
		});

		return successResponse({
			res,
			data: result,
			message: "Login successful"
		});
	};

	refreshToken = async (req, res) => {
		const result = await this.usecases.refreshTokenUseCase.execute({
			...req.body,
			ip: req.ip,
			userAgent: req.headers["user-agent"]
		});
		return successResponse({
			res,
			data: result,
			message: "Token refreshed successfully"
		});
	};

	logout = async (req, res) => {
		await this.usecases.logoutUser.execute({
			userId: req.user?.id,
			...req.body
		});

		return successResponse({
			res,
			message: "Logged out successfully"
		});
	};

	verifyOtp = async (req, res) => {
		const { email, otp } = req.body;

		const result = await this.usecases.verifyOtp.execute({
			email,
			otp,
			ip: req.ip
		});

		return successResponse({
			res,
			data: {
				user: result.user,
				accessToken: result.accessToken,
				refreshToken: result.refreshToken
			},
			message: "Email verified successfully"
		});
	};

	resendOtp = async (req, res) => {
		const { email } = req.body;

		const result = await this.usecases.resendOtp.execute({
			email,
			ip: req.ip,
			userAgent: req.headers["user-agent"]
		});

		return successResponse({
			res,
			message: result.message
		});
	};
}