import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";

export class UpgradeSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		analyticsTracker,
		subscriptionQueue 
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.analyticsTracker = analyticsTracker;
		this.subscriptionQueue = subscriptionQueue;
	}

	async execute({
		subscriptionId,
		newPlanId,
		paymentId,
		context = {} 
	}) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) {
			throw new NotFoundError("Subscription not found");
		}

		const currentPlan = await this.planRepository.findById(subscription.planId);
		const newPlan = await this.planRepository.findById(newPlanId);
		if (!newPlan) {
			throw new NotFoundError("New plan not found");
		}

		if (newPlan.price <= currentPlan.price) {
			throw new ValidationError("Only upgrades allowed");
		}

		const now = new Date();
		const remainingMs = subscription.expiresAt > now
			? subscription.expiresAt.getTime() - now.getTime()
			: 0;

		const remainingDays = Math.ceil(remainingMs / 86400000);
		const billing = PlanBillingCalculator.calculate(newPlan, 1);
		const totalDays = billing.totalDays + remainingDays;
		const newExpiresAt = new Date(now.getTime() + totalDays * 86400000);

		subscription.upgrade({
			newPlan,
			newExpiresAt,
			paymentId,
			remainingDays
		});

		subscription.mikrotikStatus = newPlan.serviceType === "hotspot" ? "synced" : "pending";
		subscription.mikrotikError = null;

		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		if (newPlan.serviceType === "pppoe" || context.source === "admin") {
			try {
				await this.subscriptionQueue.add("provision-network", {
					subscriptionId: subscription.id,
					context
				});
			} catch (queueErr) {
				console.error("[UpgradeSubscriptionUseCase] Failed to dispatch job context to Redis queue:", queueErr.message);
			}
		}

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_UPGRADED, 
				{
					accountId: subscription.accountId,
					subscriptionId: subscription.id,
					fromPlan: currentPlan.name,
					toPlan: newPlan.name,
					remainingDays
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}
