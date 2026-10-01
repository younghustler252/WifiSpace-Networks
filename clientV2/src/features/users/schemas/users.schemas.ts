import { z } from "zod";

export const GENDER_OPTIONS = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
	{ value: "other", label: "Other" },
] as const;

const PHONE_PATTERN = /^\+?[0-9\s-]{7,15}$/;

export const profileSchema = z.object({
	firstName: z.string().trim().min(2, "Enter your first name"),
	lastName: z.string().trim().min(2, "Enter your last name"),
	phone: z.string().trim().regex(PHONE_PATTERN, "Enter a valid phone number").or(z.literal("")),
	address: z.string().trim().max(200, "Keep it under 200 characters"),
	gender: z.enum(["male", "female", "other"]).or(z.literal("")),
	dateOfBirth: z.string().refine((v) => v === "" || new Date(v) <= new Date(), "Date of birth can't be in the future"),
	nin: z.string().trim().regex(/^\d{11}$/, "NIN must be 11 digits").or(z.literal("")),
});

export const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, "Enter your current password"),
		newPassword: z.string().min(8, "Use at least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your new password"),
	})
	.refine((v) => v.newPassword === v.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})
	.refine((v) => v.newPassword !== v.oldPassword, {
		message: "Choose a different password from your current one",
		path: ["newPassword"],
	});

export const ROLE_OPTIONS = [
	{ value: "customer", label: "Customer" },
	{ value: "staff", label: "Staff" },
	{ value: "superadmin", label: "Superadmin" },
] as const;

export const USER_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "banned", label: "Banned" },
	{ value: "suspended", label: "Suspended" },
] as const;

export const USER_SORT_OPTIONS = [
	{ value: "newest", label: "Newest first" },
	{ value: "oldest", label: "Oldest first" },
	{ value: "az", label: "Name A–Z" },
	{ value: "za", label: "Name Z–A" },
] as const;

export const createUserSchema = z.object({
	firstName: z.string().trim().min(2, "Enter a first name"),
	lastName: z.string().trim().min(2, "Enter a last name"),
	email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: z.string().trim().regex(PHONE_PATTERN, "Enter a valid phone number").or(z.literal("")),
	password: z.string().min(8, "Use at least 8 characters"),
	role: z.enum(["customer", "staff", "superadmin"]),
});

export const editUserSchema = z.object({
	firstName: z.string().trim().min(2, "Enter a first name"),
	lastName: z.string().trim().min(2, "Enter a last name"),
	phone: z.string().trim().regex(PHONE_PATTERN, "Enter a valid phone number").or(z.literal("")),
	address: z.string().trim().max(200, "Keep it under 200 characters"),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues = z.infer<typeof editUserSchema>;

export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;