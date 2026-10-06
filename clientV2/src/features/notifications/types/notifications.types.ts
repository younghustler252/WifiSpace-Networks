import type { PaginationMeta } from "@/types/api-response";
import type { NotificationType } from "../constants";
import type { UserProfile } from "@/features/users/types/users.types";

export interface NotificationItem {
	id: string;
	type: NotificationType | (string & {}) | null;
	title: string;
	message: string;
	status: string;
	channel?: string;
	priority?: string;
	accountId: string | null;
	entityType: string | null;
	entityId: string | null;
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
	sentBy: string | null;
	createdAt: string;
}

export interface NotificationRecipientRow {
	id: string;
	name: string;
	email: string | null;
	channel: string | null;
	status: string;
	failedReason: string | null;
	providerMessageId: string | null;
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
	sinceHours?: number;
	preview?: boolean;
}

export interface ComposePreset {
	routerIds?: string[];
	users?: UserProfile[];
	type?: string;
	priority?: string;
	title?: string;
	message?: string;
}

export interface NotificationPreview {
	recipientCount: number;
}
