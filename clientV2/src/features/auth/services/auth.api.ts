import { API } from "@/lib/api/api-client";
import { AuthSession, AuthUser, RegisterResult } from "../types/auth.types";

export const authApi = {
	login: (body: { email: string; password: string }) => API.post<AuthSession>("/auth/login", body),
	register: (body: { firstName: string; lastName: string; email: string; password: string; phone?: string }) =>
		API.post<RegisterResult>("/auth/register", body),
	verifyOtp: (body: { email: string; otp: string }) => API.post<AuthSession>("/auth/verify-otp", body),
	resendOtp: (body: { email: string }) =>
		API.post<{ message: string; otpExpiresAt: string; nextResendAt: string }>("/auth/resend-otp", body),
	forgotPassword: (body: { email: string }) => API.post<{ message: string }>("/auth/forgot-password", body),
	resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
		API.post<{ message: string }>("/auth/reset-password", body),
	logout: () => API.post<{ message: string }>("/auth/logout"),
	me: () => API.get<AuthUser>("/users/me"),
};