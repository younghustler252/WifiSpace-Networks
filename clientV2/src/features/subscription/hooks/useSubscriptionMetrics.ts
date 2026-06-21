import { useMemo } from "react";

import { Subscription } from "../subscription.types";

export function useSubscriptionMetrics(
	subscription?: Subscription
) {
	const progress = useMemo(() => {
		if (!subscription) return 0;

		const start = new Date(
			subscription.currentPeriodStart ||
			subscription.startsAt ||
			subscription.createdAt
		).getTime();

		const end = new Date(
			subscription.currentPeriodEnd ||
			subscription.expiresAt
		).getTime();

		const now = Date.now();

		if (end <= start) return 0;

		const elapsed =
			((now - start) / (end - start)) * 100;

		return Math.max(
			0,
			Math.min(100, 100 - elapsed)
		);
	}, [subscription]);

	const totalDays = useMemo(() => {
		if (!subscription) return 0;

		const start = new Date(
			subscription.startsAt ||
			subscription.createdAt
		).getTime();

		const end = new Date(
			subscription.expiresAt
		).getTime();

		return Math.ceil(
			(end - start) /
			(1000 * 60 * 60 * 24)
		);
	}, [subscription]);

	const daysLeft = useMemo(() => {
		if (!subscription) return 0;

		return Math.max(
			0,
			Math.ceil(
				(new Date(subscription.expiresAt).getTime() -
					Date.now()) /
				(1000 * 60 * 60 * 24)
			)
		);
	}, [subscription]);

	const startDate = subscription
		? new Date(
				subscription.startsAt ||
				subscription.createdAt
		  ).toLocaleDateString()
		: "";

	const endDate = subscription
		? new Date(
				subscription.expiresAt
		  ).toLocaleDateString()
		: "";

	return {
		progress,
		daysLeft,
		totalDays,
		startDate,
		endDate,
	};
}