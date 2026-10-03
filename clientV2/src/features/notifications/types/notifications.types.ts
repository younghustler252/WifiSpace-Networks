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

export interface AdminNotification {
	id: string;
	type: string | null;
	title: string;
	message: string;
	state: string;
	priority?: string;
	channel?: string;
	recipientCount?: number;
	createdAt: string;
}

export interface CreateNotificationBody {
	type: string;
	title: string;
	message: string;
	userIds?: string[];
	audience?: "all_customers";
	routerIds?: string[];
	channel?: string;
	priority?: string;
	accountId?: string;
}

export interface ComposePreset {
	routerIds?: string[];
	type?: string;
	priority?: string;
	title?: string;
	message?: string;
}

