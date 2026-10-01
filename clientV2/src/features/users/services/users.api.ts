import { API } from "@/lib/api/api-client";
import type { Role } from "@/types/roles";
import type {
	AdminUpdateUserBody,
	ChangePasswordBody,
	CreateUserBody,
	ImpersonationResult,
	UpdateProfileBody,
	UserListParams,
	UserProfile,
} from "../types/users.types";

export const usersApi = {
	me: () => API.get<UserProfile>("/users/me"),
	updateMe: (body: UpdateProfileBody) => API.patch<UserProfile>("/users/me", body),
	changePassword: (body: ChangePasswordBody) => API.patch<{ message: string }>("/users/me/password", body),
	uploadAvatar: (file: File) => {
		const form = new FormData();
		form.append("file", file);
		return API.post<UserProfile>("/users/me/avatar", form);
	},
};

const ADMIN = "/users/admin";

export const adminUsersApi = {
    get: (id: string) => API.get<UserProfile>(`${ADMIN}/${id}`),
	list: (params: UserListParams) => API.get<UserProfile[]>(ADMIN, { params }),
	create: (body: CreateUserBody) => API.post<UserProfile>(ADMIN, body),
	update: (id: string, body: AdminUpdateUserBody) => API.patch<UserProfile>(`${ADMIN}/${id}`, body),
	setRole: (id: string, role: Role) => API.patch<UserProfile>(`${ADMIN}/${id}/role`, { role }),
	ban: (id: string, reason?: string) => API.patch<UserProfile>(`${ADMIN}/${id}/ban`, { reason }),
	unban: (id: string) => API.patch<UserProfile>(`${ADMIN}/${id}/unban`),
	remove: (id: string) => API.delete<unknown>(`${ADMIN}/${id}`),
	setPassword: (id: string, newPassword: string) => API.patch<unknown>(`${ADMIN}/${id}/password`, { newPassword }),
	impersonate: (id: string) => API.post<ImpersonationResult>(`${ADMIN}/${id}/impersonate`),
};