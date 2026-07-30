import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class CreateSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({
		accountId,
		userId,
		planId,
		paymentId,
		cycles = 1
	}) {
		if (!accountId) {
			throw new ValidationError("accountId is required");
		}

		if (!userId) {
			throw new ValidationError("userId is required");
		}

		if (!planId) {
			throw new ValidationError("planId is required");
		}

		const existing =
			await this.subscriptionRepository.findActiveByAccount(accountId);

		if (existing) {
			throw new ValidationError("Account already has an active subscription");
		}

		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const expiresAt = PlanBillingCalculator.calculateExpiryDate(plan, cycles);
		const startDate = new Date();

		const graceEndsAt = plan.gracePeriodDays
			? new Date(expiresAt.getTime() + plan.gracePeriodDays * 24 * 60 * 60 * 1000)
			: null;

		const subscription = new Subscription({
			accountId,
			userId,
			planId,

			planSnapshot: {
				name: plan.name,
				serviceType: plan.serviceType,
				price: plan.price,
				durationValue: plan.durationValue,
				durationUnit: plan.durationUnit,
				speedRate: plan.speedRate,
				mikrotikProfile: plan.mikrotikProfile,
				devicesAllowed: plan.devicesAllowed,
				gracePeriodDays: plan.gracePeriodDays
			},

			status: "active",
			cycles,

			totalAmount: plan.price * cycles,

			startsAt: startDate,
			expiresAt,
			graceEndsAt,

			bonusDays: billing.bonusDays,

			activatedAt: startDate,

			lastPaymentId: paymentId,
			lastPaymentDate: paymentId ? startDate : null,
			lastPaymentAmount: paymentId ? plan.price * cycles : null,

			provisioning: { status: "not_started" },

			events: [
				{
					type: "created",
					date: new Date(),
					metadata: {
						planName: plan.name,
						price: plan.price,
						cycles,
						bonusDays: billing.bonusDays,
						expiresAt,
						graceEndsAt
					}
				}
			]
		});

		return await this.subscriptionRepository.create(subscription);
	}
}