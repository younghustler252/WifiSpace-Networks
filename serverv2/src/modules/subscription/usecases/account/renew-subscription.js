import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { calculateBonusDays } from "../../domain/calculate-bonus-days.js";

export class RenewSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		analyticsTracker
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.analyticsTracker = analyticsTracker;
	}

	async execute({ accountId, paymentId, cycles = 1 }) {
		if (!accountId)
			throw new ValidationError("accountId is required");

		if (!cycles || cycles < 1)
			throw new ValidationError("cycles must be >= 1");

		// 🔥 get subscription
		let subscription =
			await this.subscriptionRepository.findActiveByAccount(
				accountId
			);

		if (!subscription) {
			subscription =
				await this.subscriptionRepository.findLatestByAccount(
					accountId
				);
		}

		if (!subscription)
			throw new NotFoundError("No subscription found");

		// 🔥 get plan
		const plan = await this.planRepository.findById(
			subscription.planId
		);

		if (!plan)
			throw new NotFoundError("Plan not found");

		const now = new Date();

		// -----------------------------
		// 🔥 determine renewal base
		// -----------------------------
		const effectiveStart =
			subscription.endDate > now
				? new Date(subscription.endDate)
				: now;

		// -----------------------------
		// 🔥 calculate duration
		// -----------------------------
		const baseEndDate = new Date(effectiveStart);

		baseEndDate.setDate(
			baseEndDate.getDate() +
				plan.durationDays * cycles
		);

		// -----------------------------
		// 🔥 bonus calculation (RULE ENGINE)
		// -----------------------------
		const bonusDays = calculateBonusDays(plan, cycles);

		const endDate = new Date(baseEndDate);
		endDate.setDate(endDate.getDate() + bonusDays);

		// -----------------------------
		// 🔥 update subscription
		// -----------------------------
		subscription.startDate = effectiveStart;
		subscription.baseEndDate = baseEndDate;
		subscription.endDate = endDate;

		subscription.status = "active";
		subscription.lastRenewedAt = now;

		subscription.cycles += cycles;
		subscription.totalAmount += plan.price * cycles;

		subscription.bonusDays += bonusDays;

		// -----------------------------
		// 🔥 payment record
		// -----------------------------
		if (paymentId) {
			subscription.payments.push({
				paymentId,
				amount: plan.price * cycles,
				date: now
			});
		}

		// -----------------------------
		// 🔥 audit event
		// -----------------------------
		subscription.events.push({
			type: "renewed",
			date: now,
			metadata: {
				price: plan.price,
				cycles,
				bonusDays
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
		// ✅ ANALYTICS
		// -----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED,
				{
					accountId,
					plan: plan.name,
					price: plan.price,
					cycles,
					bonusDays
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}