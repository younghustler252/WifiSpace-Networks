import { z } from "zod";
import { USER_ROLE_LIST, GENDER_LIST, THEME_LIST } from "../domain/user.enum.js";

export const createUserSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum(USER_ROLE_LIST).optional(),
	phone: z.string().optional()
});

export const updateMyProfileSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	gender: z.enum(GENDER_LIST).optional(),
	dateOfBirth: z.coerce.date().optional(),
	nin: z.string().optional(),
	theme: z.enum(THEME_LIST).optional()
});

export const changePasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: z.string().min(8)
});

export const updateRoleSchema = z.object({
	role: z.enum(USER_ROLE_LIST)
});

export const banUserSchema = z.object({
	reason: z.string().optional()
});

export const adminUpdateUserSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	gender: z.enum(GENDER_LIST).optional(),
	dateOfBirth: z.coerce.date().optional(),
	nin: z.string().optional(),
	status: z.string().optional()
});

export const adminSetPasswordSchema = z.object({
	newPassword: z.string().min(8)
});