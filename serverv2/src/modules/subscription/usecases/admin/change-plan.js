import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ChangePlanUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		networkService,
		analyticsTracker
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.networkService = networkService;
		this.analyticsTracker = analyticsTracker;
	}


	async execute({
		accountId,
		newPlanId,
		reason = "admin change",
		adminId,
		paymentAdjustment = 0
	}) {

		if (!accountId) {
			throw new ValidationError(
				"accountId is required"
			);
		}


		if (!newPlanId) {
			throw new ValidationError(
				"newPlanId is required"
			);
		}


		const subscription =
			await this.subscriptionRepository.findByAccount(
				accountId
			);


		if (!subscription) {
			throw new NotFoundError(
				"Subscription not found"
			);
		}


		const newPlan =
			await this.planRepository.findById(
				newPlanId
			);


		if (!newPlan) {
			throw new NotFoundError(
				"New plan not found"
			);
		}


		const oldPlan =
			await this.planRepository.findById(
				subscription.planId
			);


		if (!oldPlan) {
			throw new NotFoundError(
				"Old plan not found"
			);
		}


		const now = new Date();


		// -----------------------------
		// UPDATE PLAN REFERENCE
		// -----------------------------

		subscription.planId = newPlanId;


		// Keep snapshot as source of truth
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
		// RESET BILLING PERIOD
		// -----------------------------

		subscription.startsAt = now;


		const expiresAt = new Date(now);


		if (newPlan.durationUnit === "days") {

			expiresAt.setDate(
				expiresAt.getDate() +
				newPlan.durationValue
			);

		} else if (newPlan.durationUnit === "months") {

			expiresAt.setMonth(
				expiresAt.getMonth() +
				newPlan.durationValue
			);

		}


		subscription.expiresAt = expiresAt;


		subscription.totalAmount =
			newPlan.price +
			paymentAdjustment;


		subscription.cycles = 1;



		// -----------------------------
		// RESTORE ACTIVE STATE
		// -----------------------------

		subscription.status = "active";
		subscription.suspendedAt = null;
		subscription.suspensionReason = null;


		// -----------------------------
		// NETWORK SYNC REQUIRED
		// -----------------------------

		subscription.mikrotikStatus = "pending";
		subscription.mikrotikError = null;



		// -----------------------------
		// AUDIT EVENT
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



		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);



		// -----------------------------
		// APPLY NEW NETWORK PROFILE
		// -----------------------------

		const networkResult =
			await this.networkService.activate(
				subscription
			);



		// -----------------------------
		// ANALYTICS
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

			console.error(
				"Analytics failed:",
				err.message
			);

		}



		return {
			subscription,
			networkResult
		};
	}
}