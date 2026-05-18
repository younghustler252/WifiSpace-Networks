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
		provisionNetworkAccountUseCase // <-- inject it
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.analyticsTracker = analyticsTracker;
		this.provisionNetworkAccountUseCase = provisionNetworkAccountUseCase;
	}

	async execute({ accountId, paymentId, cycles = 1, context = {} }) {
		if (!accountId) throw new ValidationError("accountId is required");
		if (cycles < 1) throw new ValidationError("cycles must be >= 1");

		// -------------------------
		// GET SUBSCRIPTION
		// -------------------------
		const subscription = await this.subscriptionRepository.findByAccount(accountId);
		if (!subscription) throw new NotFoundError("Subscription not found");

		// -------------------------
		// GET PLAN
		// -------------------------
		const plan = await this.planRepository.findById(subscription.planId);
		if (!plan) throw new NotFoundError("Plan not found");

		const now = new Date();
		const effectiveStart = subscription.expiresAt && subscription.expiresAt > now ? subscription.expiresAt : now;

		// -------------------------
		// BILLING CALCULATION
		// -------------------------
		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const newExpiresAt = PlanBillingCalculator.calculateExpiryDate(plan, cycles, effectiveStart);

		// -------------------------
		// ENTITY HANDLES STATE CHANGE
		// -------------------------
		subscription.renew({ newExpiresAt, paymentId, amount: plan.price * cycles });
		subscription.bonusDays += billing.bonusDays;

		subscription.addEvent("renewed", {
			accountId,
			plan: plan.name,
			cycles,
			bonusDays: billing.bonusDays,
			newExpiresAt
		});

		// -------------------------
		// SAVE SUBSCRIPTION
		// -------------------------
		await this.subscriptionRepository.update(subscription.id, subscription);

		// -------------------------
		// PROVISION NETWORK ACCOUNT (if needed)
		// -------------------------
		try {
			await this.provisionNetworkAccountUseCase.execute(subscription.id, context);
		} catch (err) {
			console.error("Provisioning after renewal failed:", err.message);
			// Decide: fail hard or just log
		}

		// -------------------------
		// ANALYTICS
		// -------------------------
		try {
			await this.analyticsTracker.track(ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED, {
				accountId,
				plan: plan.name,
				cycles,
				bonusDays: billing.bonusDays
			});
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}