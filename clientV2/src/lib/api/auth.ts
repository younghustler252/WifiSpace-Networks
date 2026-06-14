import { API } from "./client";
import { ApiResponse, User } from "./types";

// ================================
// TYPES
// ================================

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

interface LoginDto {
	email: string;
	password: string;
}

interface RegisterDto {
	firstName: string;
	lastName: string;
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

interface ResendOtpResponse {
	message: string;
	otpExpiresAt: number;
	nextResendAt: number;
	canResend: boolean;
	resendCooldownSeconds: number;
}

// ================================
// AUTH API
// ================================

export const authApi = {
	login: (data: LoginDto): Promise<ApiResponse<AuthResponse>> =>
		API.post("/auth/login", data),

	register: (data: RegisterDto): Promise<ApiResponse<User>> =>
		API.post("/auth/register", data),

	logout: (): Promise<ApiResponse<null>> =>
		API.post("/auth/logout"),

	refresh: (
		refreshToken: string
	): Promise<ApiResponse<{
			accessToken: string;
			refreshToken?: string;
		}>> => API.post("/auth/refresh", { refreshToken }),

	verifyOtp: (
		data: VerifyOtpDto
	): Promise<ApiResponse<AuthResponse>> =>
		API.post("/auth/verify-otp", data),

	resendOtp: (
		data: ResendOtpDto
	): Promise<ApiResponse<ResendOtpResponse>> =>
		API.post("/auth/resend-otp", data),
};