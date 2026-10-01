import { z } from "zod";

const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

export const loginSchema = z.object({
	email,
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
	.object({
		firstName: z.string().trim().min(2, "Enter your first name"),
		lastName: z.string().trim().min(2, "Enter your last name"),
		email,
		phone: z
			.string()
			.trim()
			.regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number")
			.optional()
			.or(z.literal("")),
		password: z.string().min(8, "Use at least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.refine((v) => v.password === v.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({ email });


export const resetPasswordSchema = z
	.object({
		email,
		otp: z.string().length(6, "Enter the 6-digit code"),
		newPassword: z.string().min(8, "Use at least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.refine((v) => v.newPassword === v.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

