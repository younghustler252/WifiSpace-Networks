import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { calculateBonusDays } from "../../domain/calculate-bonus-days.js";

export class CreateSubscriptionUseCase {
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
		accountId,
		planId,
		paymentId,
		cycles = 1
	}) {
		if (!accountId)
			throw new ValidationError("accountId is required");

		if (!planId)
			throw new ValidationError("planId is required");

		// 🔥 prevent duplicate active subscription
		const existing =
			await this.subscriptionRepository.findActiveByAccount(
				accountId
			);

		if (existing)
			throw new ValidationError(
				"Account already has an active subscription"
			);

		// 🔥 get plan
		const plan =
			await this.planRepository.findById(planId);

		if (!plan)
			throw new NotFoundError("Plan not found");

		const startDate = new Date();

		// 🔥 calculate base duration (MULTI-CYCLE SUPPORT)
		const baseEndDate = new Date(startDate);
		baseEndDate.setDate(
			baseEndDate.getDate() +
				plan.durationDays * cycles
		);

		// 🔥 calculate bonus properly (RULE ENGINE)
		const bonusDays = calculateBonusDays(plan, cycles);

		// 🔥 final expiry
		const endDate = new Date(baseEndDate);
		endDate.setDate(endDate.getDate() + bonusDays);

		// 🔥 create subscription
		const subscription =
			await this.subscriptionRepository.create({
				accountId,
				planId,

				planSnapshot: {
					name: plan.name,
					price: plan.price,
					durationDays: plan.durationDays,
					speedRate: plan.speedRate,
					devicesAllowed: plan.devicesAllowed
				},

				startDate,
				baseEndDate,
				endDate,

				status: "active",

				billingCycle: plan.billingCycle,
				cycles,

				totalAmount: plan.price * cycles,

				bonusDays,

				autoRenew: false,

				payments: paymentId
					? [
							{
								paymentId,
								amount: plan.price * cycles,
								date: new Date()
							}
					  ]
					: [],

				events: [
					{
						type: "created",
						date: new Date(),
						metadata: {
							planName: plan.name,
							price: plan.price,
							cycles,
							bonusDays
						}
					}
				]
			});

		// ----------------------------
		// ✅ ANALYTICS
		// ----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_CREATED,
				{
					plan: plan.name,
					price: plan.price,
					cycles,
					bonusDays
				}
			);
		} catch (err) {
			console.error(
				"Analytics failed:",
				err.message
			);
		}

		return subscription;
	}
}