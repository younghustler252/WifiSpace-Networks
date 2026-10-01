import type { PaginationMeta } from "@/types/api-response";
import type { NotificationType } from "../constants";

export interface NotificationItem {
	id: string;
	type: NotificationType | (string & {}) | null;
	title: string;
	message: string;
	status: string;
	channel?: string;
	priority?: string;
	accountId: string | null;
	createdAt: string;
	readAt: string | null;
	isRead: boolean;
}

export interface NotificationsPage {
	items: NotificationItem[];
	meta?: PaginationMeta;
}