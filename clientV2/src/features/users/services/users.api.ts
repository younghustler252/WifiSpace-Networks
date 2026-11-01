import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { USER_ERROR_MESSAGES } from "../constants";
import type { Role } from "@/types/roles";
import type {
	AdminUpdateUserBody,
	ChangePasswordBody,
	ConfirmEmailChangeBody,
	EmailChangeRequestBody,
	EmailChangeRequested,
	CreateUserBody,
	ImpersonationResult,
	UpdateProfileBody,
	UserListParams,
	UserProfile,
} from "../types/users.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, USER_ERROR_MESSAGES));

export const usersApi = {
	me: () => API.get<UserProfile>("/users/me"),
	updateMe: (body: UpdateProfileBody) => API.patch<UserProfile>("/users/me", body),
	changePassword: (body: ChangePasswordBody) => API.patch<{ message: string }>("/users/me/password", body),
	requestEmailChange: (body: EmailChangeRequestBody) => withMessages(API.post<EmailChangeRequested>("/users/me/email/request", body)),
	confirmEmailChange: (body: ConfirmEmailChangeBody) => withMessages(API.post<UserProfile>("/users/me/email/confirm", body)),
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
	setEmail: (id: string, email: string) => withMessages(API.patch<UserProfile>(`${ADMIN}/${id}/email`, { email })),
	setRole: (id: string, role: Role) => API.patch<UserProfile>(`${ADMIN}/${id}/role`, { role }),
	ban: (id: string, reason?: string) => API.patch<UserProfile>(`${ADMIN}/${id}/ban`, { reason }),
	unban: (id: string) => API.patch<UserProfile>(`${ADMIN}/${id}/unban`),
	remove: (id: string) => API.delete<unknown>(`${ADMIN}/${id}`),
	setPassword: (id: string, newPassword: string) => API.patch<unknown>(`${ADMIN}/${id}/password`, { newPassword }),
	impersonate: (id: string) => API.post<ImpersonationResult>(`${ADMIN}/${id}/impersonate`),
};