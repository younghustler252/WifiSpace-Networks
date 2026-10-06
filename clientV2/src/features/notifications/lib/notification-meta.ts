import {
	Bell,
	CalendarClock,
	CheckCircle2,
	LifeBuoy,
	Mail,
	Megaphone,
	MessageCircle,
	MessageSquare,
	ShieldAlert,
	ShieldCheck,
	ShieldX,
	Smartphone,
	TriangleAlert,
	XCircle,
	type LucideIcon,
} from "lucide-react";
import { NOTIFICATION_TYPES } from "../constants";
import type { NotificationItem } from "../types/notifications.types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

interface TypeMeta {
	icon: LucideIcon;
	tone: Tone;
	href: (accountId?: string | null) => string | null;
}

export const TONE_CLASSES: Record<Tone, string> = {
	success: "bg-success-soft text-success",
	warning: "bg-warning-soft text-warning",
	danger: "bg-destructive/10 text-destructive",
	info: "bg-info-soft text-info",
	neutral: "bg-muted text-muted-foreground",
};

const CHANNEL_ICONS: Record<string, LucideIcon> = {
	email: Mail,
	sms: MessageSquare,
	whatsapp: MessageCircle,
	push: Smartphone,
	in_app: Bell,
};

const CHANNEL_LABELS: Record<string, string> = {
	email: "Email",
	sms: "SMS",
	whatsapp: "WhatsApp",
	push: "Push",
	in_app: "In-app",
};

const accountHref = (accountId?: string | null) => (accountId ? `/accounts/${accountId}` : "/overview");

const META: Record<string, TypeMeta> = {
	[NOTIFICATION_TYPES.PAYMENT_RECEIVED]: { icon: CheckCircle2, tone: "success", href: () => "/payments" },
	[NOTIFICATION_TYPES.PAYMENT_FAILED]: { icon: XCircle, tone: "danger", href: () => "/payments" },
	[NOTIFICATION_TYPES.SUBSCRIPTION_ACTIVATED]: { icon: CalendarClock, tone: "success", href: accountHref },
	[NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING]: { icon: CalendarClock, tone: "warning", href: () => "/plans" },
	[NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRED]: { icon: CalendarClock, tone: "danger", href: () => "/plans" },
	[NOTIFICATION_TYPES.ACCOUNT_APPROVED]: { icon: ShieldCheck, tone: "success", href: accountHref },
	[NOTIFICATION_TYPES.ACCOUNT_REJECTED]: { icon: ShieldX, tone: "danger", href: accountHref },
	[NOTIFICATION_TYPES.ACCOUNT_SUSPENDED]: { icon: ShieldAlert, tone: "warning", href: accountHref },
	[NOTIFICATION_TYPES.ADMIN_BROADCAST]: { icon: Megaphone, tone: "info", href: () => null },
	[NOTIFICATION_TYPES.SYSTEM_ALERT]: { icon: TriangleAlert, tone: "warning", href: () => null },
	[NOTIFICATION_TYPES.TICKET_REPLY]: { icon: LifeBuoy, tone: "info", href: () => "/support" },
	[NOTIFICATION_TYPES.TICKET_STATUS_CHANGED]: { icon: LifeBuoy, tone: "info", href: () => "/support" },
};

const ENTITY_HREF: Record<string, (id: string) => string> = {
	Ticket: (id) => `/support/${id}`,
	Account: (id) => `/accounts/${id}`,
	Payment: () => "/payments",
};

export function getNotificationMeta(type: string | null, channel?: string): TypeMeta {
	const known = type ? META[type] : undefined;
	return known ?? { icon: CHANNEL_ICONS[channel ?? ""] ?? Bell, tone: "neutral", href: () => null };
}

export function getNotificationHref(item: NotificationItem) {
	if (item.entityType && item.entityId) {
		const build = ENTITY_HREF[item.entityType];
		if (build) return build(item.entityId);
	}
	return getNotificationMeta(item.type, item.channel).href(item.accountId);
}

export function getChannelLabel(channel?: string) {
	return channel ? (CHANNEL_LABELS[channel] ?? channel) : undefined;
}