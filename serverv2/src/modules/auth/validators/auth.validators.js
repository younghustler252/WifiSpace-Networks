import { z } from "zod";

export const registerSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	phone: z.string().optional()
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required")
});

export const verifyOtpSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(6, "OTP must be 6 digits")
});

export const resendOtpSchema = z.object({
	email: z.string().email()
});

export const forgotPasswordSchema = z.object({
	email: z.string().email()
});

export const resetPasswordSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(6),
	newPassword: z.string().min(8, "Password must be at least 8 characters")
});