import { API } from "@/lib/api/api-client";

export const notificationsApi = {
	listMine: (params: { page?: number; limit?: number }) =>
		API.get<Record<string, unknown>[]>("/notifications/me", { params }),
	markRead: (id: string) => API.patch<unknown>(`/notifications/me/${encodeURIComponent(id)}/read`),
};