import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class AdminChangePlanUseCase {
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
		newPlanId,
		reason = "admin change",
		adminId,
		paymentAdjustment = 0
	}) {
		if (!accountId)
			throw new ValidationError("accountId is required");

		if (!newPlanId)
			throw new ValidationError("newPlanId is required");

		// 🔥 get subscription (active or suspended)
		const subscription =
			await this.subscriptionRepository.findByAccount(
				accountId
			);

		if (!subscription)
			throw new NotFoundError(
				"Subscription not found"
			);

		// 🔥 get plans
		const newPlan =
			await this.planRepository.findById(newPlanId);

		if (!newPlan)
			throw new NotFoundError("New plan not found");

		const oldPlan =
			await this.planRepository.findById(
				subscription.planId
			);

		if (!oldPlan)
			throw new NotFoundError("Old plan not found");

		const now = new Date();

		// -----------------------------
		// 🔥 RESET MODEL (SAFE APPROACH)
		// -----------------------------
		subscription.planId = newPlanId;

		subscription.planSnapshot = {
			name: newPlan.name,
			price: newPlan.price,
			durationDays: newPlan.durationDays,
			speedRate: newPlan.speedRate,
			devicesAllowed: newPlan.devicesAllowed
		};

		// 🔥 reset timeline (admin override)
		subscription.startDate = now;

		const newBaseEndDate = new Date(now);
		newBaseEndDate.setDate(
			newBaseEndDate.getDate() +
				newPlan.durationDays
		);

		subscription.baseEndDate = newBaseEndDate;
		subscription.endDate = newBaseEndDate;

		// -----------------------------
		// 🔥 billing adjustments
		// -----------------------------
		subscription.totalAmount += paymentAdjustment;

		subscription.cycles = 1;

		// -----------------------------
		// 🔥 clear suspension if any
		// -----------------------------
		subscription.status = "active";
		subscription.suspendedAt = null;
		subscription.suspensionReason = null;

		// -----------------------------
		// 🔥 audit event (VERY IMPORTANT)
		// -----------------------------
		subscription.events.push({
			type: "admin_plan_changed",
			date: now,
			metadata: {
				adminId,
				from: oldPlan.name,
				to: newPlan.name,
				reason,
				paymentAdjustment
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
		// ✅ analytics
		// -----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_ADMIN_CHANGED,
				{
					accountId,
					from: oldPlan.name,
					to: newPlan.name,
					adminId
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}