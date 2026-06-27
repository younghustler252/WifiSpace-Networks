import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class RenewSubscriptionUseCase {
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
		paymentId,
		cycles = 1,
		context = {}
	}) {
		if (!subscriptionId) {
			throw new ValidationError("subscriptionId is required");
		}

		if (cycles < 1) {
			throw new ValidationError("cycles must be >= 1");
		}

		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) {
			throw new NotFoundError("Subscription not found");
		}

		const accountId = subscription.accountId;
		const plan = await this.planRepository.findById(subscription.planId);
		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		const now = new Date();
		const effectiveStart = subscription.expiresAt && subscription.expiresAt > now
			? subscription.expiresAt
			: now;

		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const newExpiresAt = PlanBillingCalculator.calculateExpiryDate(
			plan,
			cycles,
			effectiveStart
		);

		subscription.renew({
			newExpiresAt,
			paymentId,
			amount: plan.price * cycles,
			cycles
		});

		subscription.bonusDays += billing.bonusDays;
		subscription.mikrotikStatus = plan.serviceType === "hotspot" ? "synced" : "pending";
		subscription.mikrotikError = null;

		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		if (plan.serviceType === "pppoe" || context.source === "admin") {
			try {
				await this.subscriptionQueue.add("provision-network", {
					subscriptionId: subscription.id,
					context
				});
			} catch (queueErr) {
				console.error("[RenewSubscriptionUseCase] Failed to dispatch job context to Redis queue:", queueErr.message);
			}
		}

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED,
				{
					accountId,
					subscriptionId: subscription.id,
					plan: plan.name,
					cycles,
					bonusDays: billing.bonusDays
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}
