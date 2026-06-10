// src/modules/auth/presentation/controllers/auth.controller.js

import { successResponse } from "../../../../shared/utils/api-response.js";

export class AuthController {

	constructor({
		registerUser,
		loginUser,
		refreshTokenUseCase,
		logoutUser,
		verifyOtp,
		resendOtp,
		
	}) {
	
		this.registerUserUseCase = registerUser;
		this.loginUserUseCase = loginUser;
		this.refreshTokenUseCase = refreshTokenUseCase;
		this.logoutUserUseCase = logoutUser;
		this.verifyOtpUseCase = verifyOtp;
		this.resendOtpUseCase = resendOtp;
	}

	// -----------------------------
	// AUTH
	// -----------------------------

	register = async (req, res) => {

		const user =
			await this.registerUserUseCase.execute({
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

		const result =
			await this.loginUserUseCase.execute({
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

		const result =
			await this.refreshTokenUseCase.execute({
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

		await this.logoutUserUseCase.execute({
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

		const result =
			await this.verifyOtpUseCase.execute({
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

		const result =
			await this.resendOtpUseCase.execute({
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