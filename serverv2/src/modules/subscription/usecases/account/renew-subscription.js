import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";

export class RenewSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({
		subscriptionId,
		paymentId,
		cycles = 1
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

		const plan = await this.planRepository.findById(subscription.planId);
		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		const now = new Date();
		const effectiveStart = subscription.expiresAt && subscription.expiresAt > now
			? subscription.expiresAt
			: now;

		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const newExpiresAt = PlanBillingCalculator.calculateExpiryDate(plan, cycles, effectiveStart);

		subscription.renew({
			newExpiresAt,
			paymentId,
			amount: plan.price * cycles,
			cycles
		});

		subscription.bonusDays += billing.bonusDays;

		subscription.provisioning = { status: "not_started" };

		await this.subscriptionRepository.update(subscription.id, subscription);

		return subscription;
	}
}