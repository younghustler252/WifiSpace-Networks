import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class CreateSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		analyticsTracker,
		provisionNetworkAccountUseCase // <-- inject this
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.analyticsTracker = analyticsTracker;
		this.provisionNetworkAccountUseCase = provisionNetworkAccountUseCase;
	}

	async execute({
		accountId,
		userId,
		planId,
		paymentId,
		cycles = 1,
		context = {}
	}) {
		if (!accountId) throw new ValidationError("accountId is required");
		if (!userId) throw new ValidationError("userId is required");
		if (!planId) throw new ValidationError("planId is required");

		// ---------------------------------
		// prevent duplicate active subscription
		// ---------------------------------
		const existing = await this.subscriptionRepository.findActiveByAccount(accountId);
		if (existing) throw new ValidationError("Account already has an active subscription");

		// ---------------------------------
		// get plan
		// ---------------------------------
		const plan = await this.planRepository.findById(planId);
		if (!plan) throw new NotFoundError("Plan not found");

		// ---------------------------------
		// BILLING CALCULATION
		// ---------------------------------
		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const expiresAt = PlanBillingCalculator.calculateExpiryDate(plan, cycles);
		const startDate = new Date();
		const graceEndsAt = plan.gracePeriodDays
			? new Date(expiresAt.getTime() + plan.gracePeriodDays * 24 * 60 * 60 * 1000)
			: null;

		// ---------------------------------
		// CREATE SUBSCRIPTION ENTITY
		// ---------------------------------
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
			events: [
				{
					type: "created",
					date: new Date(),
					metadata: { planName: plan.name, price: plan.price, cycles, bonusDays: billing.bonusDays, expiresAt, graceEndsAt }
				}
			]
		});

		// ---------------------------------
		// SAVE SUBSCRIPTION
		// ---------------------------------
		const savedSubscription = await this.subscriptionRepository.create(subscription);

		// ---------------------------------
		// PROVISION NETWORK ACCOUNT
		// ---------------------------------
		try {
			await this.provisionNetworkAccountUseCase.execute(savedSubscription.id, context);
		} catch (err) {
			console.error("Provisioning failed:", err.message);
			// Decide: either fail the whole create, or continue and let admin retry
		}

		// ---------------------------------
		// TRACK ANALYTICS
		// ---------------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_CREATED,
				{ plan: plan.name, price: plan.price, cycles, bonusDays: billing.bonusDays, graceEndsAt }
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return savedSubscription;
	}
}