import type { AuthUser } from "@/features/auth/types/auth.types";
import { Role } from "@/types/roles";
export type ThemePreference = "light" | "dark" | "system";

export interface UserProfile extends AuthUser {
	status: string;
	nin?: string | null;
	address?: string | null;
	dateOfBirth?: string | null;
	gender?: string | null;
	lastLoginAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateProfileBody {
	firstName?: string;
	lastName?: string;
	phone?: string;
	address?: string;
	gender?: string;
	dateOfBirth?: string;
	nin?: string;
	theme?: ThemePreference;
}

export interface ChangePasswordBody {
	oldPassword: string;
	newPassword: string;
}

export interface UserListParams {
	status?: string;
	role?: string;
	search?: string;
	sort?: string;
	page?: number;
	limit?: number;
}

export interface CreateUserBody {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: Role;
	phone?: string;
}

export interface AdminUpdateUserBody {
	firstName?: string;
	lastName?: string;
	phone?: string;
	address?: string;
}

export interface ImpersonationResult {
	accessToken: string;
	impersonating: AuthUser;
}export interface UserListParams {
	status?: string;
	role?: string;
	search?: string;
	sort?: string;
	page?: number;
	limit?: number;
}

export interface CreateUserBody {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: Role;
	phone?: string;
}

export interface AdminUpdateUserBody {
	firstName?: string;
	lastName?: string;
	phone?: string;
	address?: string;
}

export interface ImpersonationResult {
	accessToken: string;
	impersonating: AuthUser;
}