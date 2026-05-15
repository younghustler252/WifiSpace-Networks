import { API } from "./client";
import { ApiResponse, LoginResponse, User } from "./types";

// ================================
// REQUEST TYPES
// ================================

interface LoginDto {
	email: string;
	password: string;
}

interface RegisterDto {
	email: string;
	password: string;
}

interface RefreshDto {
	refreshToken: string;
}

interface VerifyOtpDto {
	email: string;
	otp: string;
}

interface ResendOtpDto {
	email: string;
}

// ================================
// AUTH API
// ================================

export const authApi = {
	login: (
		data: LoginDto
	): Promise<ApiResponse<LoginResponse>> =>
		API.post("/auth/login", data),

	register: (
		data: RegisterDto
	): Promise<ApiResponse<User>> =>
		API.post("/auth/register", data),

	logout: (): Promise<ApiResponse<null>> =>
		API.post("/auth/logout"),

	refresh: (
		refreshToken: string
	): Promise<ApiResponse<{ accessToken: string }>> =>
		API.post("/auth/refresh", { refreshToken }),

	// OTP Verification
	verifyOtp: (
		data: VerifyOtpDto
	): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> =>
		API.post("/auth/verify-otp", data),

	// Resend OTP
	resendOtp: (
		data: ResendOtpDto
	): Promise<ApiResponse<{ message: string }>> =>
		API.post("/auth/resend-otp", data),
};														