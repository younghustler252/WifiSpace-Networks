import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class UpgradeSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		analyticsTracker
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.analyticsTracker = analyticsTracker;
	}

	async execute({ accountId, newPlanId, paymentId }) {
		if (!accountId)
			throw new ValidationError("accountId is required");

		if (!newPlanId)
			throw new ValidationError("newPlanId is required");

		// 🔥 get active subscription
		const subscription =
			await this.subscriptionRepository.findActiveByAccount(
				accountId
			);

		if (!subscription)
			throw new NotFoundError(
				"No active subscription found"
			);

		// 🔥 get new plan
		const newPlan =
			await this.planRepository.findById(newPlanId);

		if (!newPlan)
			throw new NotFoundError("Plan not found");

		// 🔥 get current plan for comparison
		const currentPlan =
			await this.planRepository.findById(
				subscription.planId
			);

		if (!currentPlan)
			throw new NotFoundError("Current plan not found");

		// -----------------------------
		// ❗ ENFORCE UPGRADE ONLY
		// -----------------------------
		if (newPlan.price <= currentPlan.price) {
			throw new ValidationError(
				"Only upgrades are allowed for users"
			);
		}

		const now = new Date();

		// -----------------------------
		// 🔥 preserve remaining time
		// -----------------------------
		const remainingTime =
			subscription.endDate > now
				? subscription.endDate.getTime() - now.getTime()
				: 0;

		// -----------------------------
		// 🔥 new base duration
		// -----------------------------
		const baseEndDate = new Date(now);
		baseEndDate.setDate(
			baseEndDate.getDate() + newPlan.durationDays
		);

		// -----------------------------
		// 🔥 merge remaining time
		// -----------------------------
		const endDate = new Date(
			baseEndDate.getTime() + remainingTime
		);

		// -----------------------------
		// 🔥 update subscription
		// -----------------------------
		subscription.planId = newPlanId;

		subscription.planSnapshot = {
			name: newPlan.name,
			price: newPlan.price,
			durationDays: newPlan.durationDays,
			speedRate: newPlan.speedRate,
			devicesAllowed: newPlan.devicesAllowed
		};

		subscription.startDate = now;
		subscription.baseEndDate = baseEndDate;
		subscription.endDate = endDate;

		subscription.totalAmount += newPlan.price;

		subscription.cycles += 1;

		// -----------------------------
		// 🔥 payment record
		// -----------------------------
		if (paymentId) {
			subscription.payments.push({
				paymentId,
				amount: newPlan.price,
				date: now
			});
		}

		// -----------------------------
		// 🔥 audit event
		// -----------------------------
		subscription.events.push({
			type: "upgraded",
			date: now,
			metadata: {
				from: currentPlan.name,
				to: newPlan.name,
				price: newPlan.price
			}
		});

		// -----------------------------
		// 🔥 persist
		// -----------------------------
		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		// -----------------------------
		// ✅ analytics
		// -----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_UPGRADED,
				{
					accountId,
					from: currentPlan.name,
					to: newPlan.name
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}