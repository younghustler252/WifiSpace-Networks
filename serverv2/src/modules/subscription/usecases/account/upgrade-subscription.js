import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";

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

	async execute({
		subscriptionId,
		newPlanId,
		paymentId
	}) {
		const subscription =
			await this.subscriptionRepository.findById(subscriptionId);

		if (!subscription) {
			throw new NotFoundError("Subscription not found");
		}

		const currentPlan =
			await this.planRepository.findById(subscription.planId);

		const newPlan =
			await this.planRepository.findById(newPlanId);

		if (!newPlan) {
			throw new NotFoundError("New plan not found");
		}

		if (newPlan.price <= currentPlan.price) {
			throw new ValidationError("Only upgrades allowed");
		}

		const now = new Date();

		const remainingMs =
			subscription.expiresAt > now
				? subscription.expiresAt.getTime() - now.getTime()
				: 0;

		const remainingDays =
			Math.ceil(remainingMs / 86400000);

		const billing =
			PlanBillingCalculator.calculate(newPlan, 1);

		const totalDays =
			billing.totalDays + remainingDays;

		const newExpiresAt = new Date(
			now.getTime() + totalDays * 86400000
		);

		subscription.upgrade({
			newPlan,
			newExpiresAt,
			paymentId,
			remainingDays
		});

		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		return subscription;
	}
}