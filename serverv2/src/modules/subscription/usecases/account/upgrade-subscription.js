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

	async execute({ accountId, newPlanId, paymentId }) {
		if (!accountId) {
			throw new ValidationError("accountId is required");
		}

		if (!newPlanId) {
			throw new ValidationError("newPlanId is required");
		}

		// -----------------------------
		// GET ACTIVE SUBSCRIPTION
		// -----------------------------

		const subscription =
			await this.subscriptionRepository.findActiveByAccount(accountId);

		if (!subscription) {
			throw new NotFoundError("No active subscription found");
		}

		// -----------------------------
		// GET PLANS
		// -----------------------------

		const newPlan =
			await this.planRepository.findById(newPlanId);

		if (!newPlan) {
			throw new NotFoundError("New plan not found");
		}

		const currentPlan =
			await this.planRepository.findById(subscription.planId);

		if (!currentPlan) {
			throw new NotFoundError("Current plan not found");
		}

		// -----------------------------
		// UPGRADE RULE (price-based)
		// -----------------------------

		if (newPlan.price <= currentPlan.price) {
			throw new ValidationError("Only upgrades allowed");
		}

		const now = new Date();

		// -----------------------------
		// REMAINING TIME (ENTITLEMENT)
		// -----------------------------

		const remainingMs =
			subscription.expiresAt && subscription.expiresAt > now
				? subscription.expiresAt.getTime() - now.getTime()
				: 0;

		const remainingDays = Math.ceil(remainingMs / 86400000);

		// -----------------------------
		// NEW PLAN ENTITLEMENT
		// -----------------------------

		const billing =
			PlanBillingCalculator.calculate(newPlan, 1);

		const newPlanDays =
			PlanBillingCalculator.calculate(plan, 1).totalDays;

		// -----------------------------
		// FINAL EXPIRY (MERGED MODEL)
		// -----------------------------

		const totalDays =
			newPlanDays + remainingDays;

		const newExpiresAt = new Date(
			now.getTime() + totalDays * 86400000
		);

		// -----------------------------
		// UPDATE SNAPSHOT
		// -----------------------------

		const fromPlanName = currentPlan.name;

		subscription.planId = newPlanId;

		subscription.planSnapshot = {
			name: newPlan.name,
			serviceType: newPlan.serviceType,
			price: newPlan.price,
			durationValue: newPlan.durationValue,
			durationUnit: newPlan.durationUnit,
			speedRate: newPlan.speedRate,
			mikrotikProfile: newPlan.mikrotikProfile,
			devicesAllowed: newPlan.devicesAllowed,
			gracePeriodDays: newPlan.gracePeriodDays
		};

		// -----------------------------
		// USE ENTITY METHOD (IMPORTANT)
		// -----------------------------

		subscription.expiresAt = newExpiresAt;
		subscription.lastRenewedAt = now;
		subscription.status = "active";
		subscription.expiredAt = null;

		subscription.cycles += 1;

		// IMPORTANT: do NOT touch totalAmount logic here (payment owns money)

		// -----------------------------
		// EVENT
		// -----------------------------

		subscription.addEvent("upgraded", {
			from: fromPlanName,
			to: newPlan.name,
			remainingDays,
			newExpiresAt
		});

		// -----------------------------
		// SAVE
		// -----------------------------

		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		// -----------------------------
		// ANALYTICS
		// -----------------------------

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_UPGRADED,
				{
					accountId,
					from: fromPlanName,
					to: newPlan.name,
					remainingDays
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}