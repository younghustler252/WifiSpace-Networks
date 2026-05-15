import { API } from "./client";
import { ApiResponse, User } from "./types";

// ================================
// REQUEST TYPES
// ================================

interface UpdateProfileDto {
	email?: string;
}

interface ChangePasswordDto {
	currentPassword: string;
	newPassword: string;
}

interface CreateUserDto {
	email: string;
	password: string;
	role?: string;
}

interface UpdateUserRoleDto {
	userId: string;
	role: string;
}

type PaginatedUsers = {
	data: User[];
	total: number;
	skip: number;
	limit: number;
};

// ================================
// USER API
// ================================

export const userApi = {
	// -----------------------------
	// SELF ROUTES
	// -----------------------------

	getProfile: (): Promise<ApiResponse<User>> =>
		API.get("/users/me"),

	updateProfile: (
		data: UpdateProfileDto
	): Promise<ApiResponse<User>> =>
		API.put("/users/me", data),

	changePassword: (
		data: ChangePasswordDto
	): Promise<ApiResponse<null>> =>
		API.post("/users/me/change-password", data),

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------
	getAllUsers: (params?: {
		search?: string;
		status?: string;
		role?: string;
		sort?: "az" | "za" | "newest" | "oldest";
		skip?: number;
		limit?: number;
	}): Promise<ApiResponse<PaginatedUsers>> =>
		API.get("/users/admin/users", { params }),

	getUserById: (id: string): Promise<ApiResponse<User>> =>
		API.get(`/users/admin/users/${id}`),

	createUser: (
		data: CreateUserDto
	): Promise<ApiResponse<User>> =>
		API.post("/users/admin/create", data),

	updateUserRole: (
		data: UpdateUserRoleDto
	): Promise<ApiResponse<User>> =>
		API.put("/users/admin/update-role", data),

	updateUserProfile: (
		userId: string,
		data: Partial<User>
	): Promise<ApiResponse<User>> =>
		API.put(`/users/admin/${userId}`, data),

	deleteUser: (
		userId: string
	): Promise<ApiResponse<null>> =>
		API.delete(`/users/admin/${userId}`),

	banUser: (
		userId: string
	): Promise<ApiResponse<User>> =>
		API.put(`/users/admin/ban/${userId}`),
};