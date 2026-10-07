import type { Subscription } from "../types/subscriptions.types";

export type SubscriptionPhase = "none" | "active" | "grace" | "expired" | "suspended" | "canceled";

export type SubscriptionAction = "usage" | "extend" | "renew" | "change-plan" | "suspend" | "resume" | "cancel" | "force-expire";

const timeOf = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

export function getSubscriptionPhase(subscription: Subscription | null, now = Date.now()): SubscriptionPhase {
	if (!subscription) return "none";

	switch (subscription.status) {
		case "suspended":
			return "suspended";
		case "canceled":
			return "canceled";
		case "expired":
			return "expired";
		case "pending":
			return "none";
	}

	if (!subscription.expiresAt) return "none";
	if (timeOf(subscription.expiresAt) > now) return "active";

	const graceEnds = timeOf(subscription.graceEndsAt);
	return graceEnds > now ? "grace" : "expired";
}

const PHASE_ORDER: Record<SubscriptionPhase, number> = {
	active: 0,
	grace: 1,
	suspended: 2,
	expired: 3,
	canceled: 4,
	none: 5,
};

export function pickCurrentSubscription(subscriptions: Subscription[] | undefined, accountId: string) {
	const mine = (subscriptions ?? []).filter((s) => s.accountId === accountId);
	if (mine.length === 0) return null;

	const recency = (s: Subscription) => timeOf(s.expiresAt) || timeOf(s.startsAt) || timeOf(s.createdAt);

	return [...mine].sort(
		(a, b) => PHASE_ORDER[getSubscriptionPhase(a)] - PHASE_ORDER[getSubscriptionPhase(b)] || recency(b) - recency(a)
	)[0];
}

export function listAccountSubscriptions(subscriptions: Subscription[] | undefined, accountId: string) {
	const time = (s: Subscription) => timeOf(s.startsAt) || timeOf(s.createdAt);
	return (subscriptions ?? []).filter((s) => s.accountId === accountId).sort((a, b) => time(b) - time(a));
}

export function getSubscriptionActions(subscription: Subscription): SubscriptionAction[] {
	switch (getSubscriptionPhase(subscription)) {
		case "active":
			return ["usage", "extend", "renew", "change-plan", "suspend", "cancel", "force-expire"];
		case "grace":
			return ["usage", "extend", "renew", "cancel"];
		case "expired":
			return ["usage", "renew", "extend"];
		case "suspended":
			return ["usage", "resume", "cancel"];
		default:
			return ["usage"];
	}
}

export function getDisplayStatus(subscription: Subscription) {
	const phase = getSubscriptionPhase(subscription);
	return phase === "none" ? subscription.status : phase;
}

export function effectiveEnd(subscription: Subscription) {
	if (subscription.status === "expired") return subscription.expiredAt ?? subscription.expiresAt;
	if (subscription.status === "canceled") return subscription.canceledAt ?? subscription.expiresAt;
	return subscription.expiresAt;
}

export function endedEarly(subscription: Subscription, now = Date.now()) {
	if (subscription.status !== "expired" && subscription.status !== "canceled") return false;
	return timeOf(subscription.expiresAt) > now;
}