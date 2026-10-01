import { successResponse } from "../../../shared/utils/api-response.js";
import { toAuthResponse } from "../dto/auth.dto.js";
import { setAuthCookies, clearAuthCookies } from "../../../shared/utils/cookie.js";

export class AuthController {
	constructor({ registerUser, loginUser, refreshTokenUseCase, logoutUser, verifyOtp, resendOtp, forgotPassword, resetPassword }) {
		this.registerUserUseCase = registerUser;
		this.loginUserUseCase = loginUser;
		this.refreshTokenUseCase = refreshTokenUseCase;
		this.logoutUserUseCase = logoutUser;
		this.verifyOtpUseCase = verifyOtp;
		this.resendOtpUseCase = resendOtp;
		this.forgotPasswordUseCase = forgotPassword;
		this.resetPasswordUseCase = resetPassword;
	}

	register = async (req, res) => {
		const user = await this.registerUserUseCase.execute({ ...req.body, ip: req.ip, userAgent: req.headers["user-agent"] });
		return successResponse({ res, data: user, message: "User registered successfully. Verification email sent." });
	};

	login = async (req, res) => {
		const result = await this.loginUserUseCase.execute({ ...req.body, ip: req.ip, userAgent: req.headers["user-agent"] });
		setAuthCookies(res, result);
		return successResponse({ res, data: toAuthResponse(result.user, result), message: "Login successful" });
	};

	refreshToken = async (req, res) => {
		const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
		const result = await this.refreshTokenUseCase.execute({ refreshToken });
		setAuthCookies(res, result);
		return successResponse({ res, data: result, message: "Token refreshed successfully" });
	};

	logout = async (req, res) => {
		await this.logoutUserUseCase.execute({
			userId: req.user?.id,
			accessToken: req.token || req.cookies?.accessToken,
			refreshToken: req.cookies?.refreshToken
		});
		clearAuthCookies(res);
		return successResponse({ res, message: "Logged out successfully" });
	};

	verifyOtp = async (req, res) => {
		const { email, otp } = req.body;
		const result = await this.verifyOtpUseCase.execute({ email, otp, ip: req.ip });
		setAuthCookies(res, result);
		return successResponse({ res, data: toAuthResponse(result.user, result), message: "Email verified successfully" });
	};

	resendOtp = async (req, res) => {
		const result = await this.resendOtpUseCase.execute({ email: req.body.email });
		return successResponse({ res, message: result.message, data: { otpExpiresAt: result.otpExpiresAt, nextResendAt: result.nextResendAt } });
	};

	forgotPassword = async (req, res) => {
		const result = await this.forgotPasswordUseCase.execute({ email: req.body.email });
		return successResponse({ res, message: result.message });
	};

	resetPassword = async (req, res) => {
		const { email, otp, newPassword } = req.body;
		const result = await this.resetPasswordUseCase.execute({ email, otp, newPassword, ip: req.ip });
		return successResponse({ res, message: result.message });
	};
}