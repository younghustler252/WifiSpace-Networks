import { CheckCircle2, Circle, Clock, Pause, Play, PlusCircle, RefreshCw, SlidersHorizontal, XCircle, type LucideIcon } from "lucide-react";
import { formatDateTime, humanize } from "@/lib/format";
import type { SubscriptionEvent } from "../types/subscriptions.types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const EVENT_TONE: Record<Tone, string> = {
	success: "bg-success-soft text-success",
	warning: "bg-warning-soft text-warning",
	danger: "bg-destructive/10 text-destructive",
	info: "bg-info-soft text-info",
	neutral: "bg-muted text-muted-foreground",
};

const EVENTS: Record<string, { label: string; icon: LucideIcon; tone: Tone }> = {
	created: { label: "Created", icon: PlusCircle, tone: "info" },
	activated: { label: "Activated", icon: CheckCircle2, tone: "success" },
	renewed: { label: "Renewed", icon: RefreshCw, tone: "success" },
	suspended: { label: "Suspended", icon: Pause, tone: "warning" },
	resumed: { label: "Resumed", icon: Play, tone: "success" },
	expired: { label: "Expired", icon: Clock, tone: "neutral" },
	canceled: { label: "Canceled", icon: XCircle, tone: "danger" },
	manual_adjustment: { label: "Manual adjustment", icon: SlidersHorizontal, tone: "info" },
};

export function eventMeta(type: string) {
	return EVENTS[type] ?? { label: humanize(type), icon: Circle, tone: "neutral" as Tone };
}

const ISO = /^\d{4}-\d{2}-\d{2}T/;

const metaLabel = (key: string) => humanize(key.replace(/([A-Z])/g, "_$1").toLowerCase());

export function describeEvent(event: SubscriptionEvent) {
	return Object.entries(event.metadata ?? {})
		.filter(([key, value]) => value !== null && value !== undefined && value !== "" && typeof value !== "object" && !(key === "bonusDays" && value === 0))
		.map(([key, value]) => `${metaLabel(key)}: ${typeof value === "string" && ISO.test(value) ? formatDateTime(value) : String(value)}`)
		.join(" · ");
}
