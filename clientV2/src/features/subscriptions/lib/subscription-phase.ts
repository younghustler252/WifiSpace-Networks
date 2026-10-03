import type { Subscription } from "../types/subscriptions.types";

export type SubscriptionPhase = "none" | "active" | "grace" | "expired" | "suspended" | "canceled";

export function pickCurrentSubscription(subscriptions: Subscription[] | undefined, accountId: string) {
	const mine = (subscriptions ?? []).filter((s) => s.accountId === accountId);
	if (mine.length === 0) return null;
	const time = (s: Subscription) => new Date(s.expiresAt ?? s.createdAt).getTime();
	return mine.sort((a, b) => time(b) - time(a))[0];
}

export function getSubscriptionPhase(subscription: Subscription | null, now = Date.now()): SubscriptionPhase {
	if (subscription?.status === "pending") return "none";
	if (!subscription || !subscription.expiresAt) return "none";
	if (subscription.status === "suspended") return "suspended";
	if (subscription.status === "canceled") return "canceled";
	if (new Date(subscription.expiresAt).getTime() > now) return "active";
	const graceEnds = subscription.graceEndsAt ? new Date(subscription.graceEndsAt).getTime() : null;
	return graceEnds !== null && graceEnds > now ? "grace" : "expired";
}

export function listAccountSubscriptions(subscriptions: Subscription[] | undefined, accountId: string) {
	const time = (s: Subscription) => new Date(s.startsAt ?? s.createdAt).getTime();
	return (subscriptions ?? []).filter((s) => s.accountId === accountId).sort((a, b) => time(b) - time(a));
}

export type SubscriptionAction = "usage" | "extend" | "renew" | "change-plan" | "suspend" | "resume" | "cancel" | "force-expire";

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
