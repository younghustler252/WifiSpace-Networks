import { API } from "@/lib/api/api-client";
import type { CreateNotificationBody, NotificationPreview } from "../types/notifications.types";

export const notificationsApi = {
	listMine: (params: { page?: number; limit?: number }) =>
		API.get<Record<string, unknown>[]>("/notifications/me", { params }),
	markRead: (id: string) => API.patch<unknown>(`/notifications/me/${encodeURIComponent(id)}/read`),
};


export const adminNotificationsApi = {
	list: (params: { page?: number; limit?: number }) => API.get<Record<string, unknown>[]>("/notifications/admin", { params }),
	recipients: (id: string, params: { page?: number; limit?: number }) =>
		API.get<Record<string, unknown>[]>(`/notifications/admin/${id}/recipients`, { params }),
	create: (body: CreateNotificationBody) => API.post<unknown>("/notifications/admin", body),
	preview: (body: CreateNotificationBody) => API.post<NotificationPreview>("/notifications/admin", { ...body, preview: true }),
};