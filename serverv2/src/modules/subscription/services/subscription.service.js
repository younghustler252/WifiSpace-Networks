import { ValidationError } from "../../../shared/errors/validation-error.js";
import { AppError } from "../../../shared/errors/app-error.js";

export class SubscriptionService {

	constructor({
		subscriptionRepository,
		planRepository,
		createSubscription,
		renewSubscription,
		upgradeSubscription
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.createSubscription = createSubscription;
		this.renewSubscription = renewSubscription;
		this.upgradeSubscription = upgradeSubscription;
	}

	// =====================================================
	// MAIN ENTRY POINT
	// =====================================================
	async process({
		payment,
		account,
		user,
		plan
	}) {

		if (!payment) {
			throw new ValidationError("Payment is required");
		}

		if (!account) {
			throw new ValidationError("Account is required");
		}

		if (!user) {
			throw new ValidationError("User is required");
		}

		if (!plan) {
			throw new ValidationError("Plan is required");
		}

		// =====================================================
		// FIND ACTIVE SUBSCRIPTION
		// =====================================================
		const activeSubscription =
			await this.subscriptionRepository.findActiveByAccount(
				account.id
			);

		// =====================================================
		// CASE 1: NO ACTIVE SUBSCRIPTION → CREATE
		// =====================================================
		if (!activeSubscription) {

			const subscription =
				await this.createSubscription.execute({
					accountId: account.id,
					userId: user.id,
					planId: plan.id,
					paymentId: payment.id,
					cycles: payment.cycles || 1
				});

			return {
				action: "created",
				subscription
			};
		}

		// =====================================================
		// NORMALIZE PLAN IDS
		// =====================================================
		const activePlanId =
			this._normalizeId(activeSubscription.planId);

		const newPlanId =
			this._normalizeId(plan.id || plan._id);

		const samePlan = activePlanId === newPlanId;

		// =====================================================
		// CASE 2: SAME PLAN → RENEW
		// =====================================================
		if (samePlan) {

			const result =
				await this.renewSubscription.execute({
					subscriptionId: activeSubscription.id,
					paymentId: payment.id,
					cycles: payment.cycles || 1
				});

			return {
				action: "renewed",
				subscription: result
			};
		}

		// =====================================================
		// LOAD PLAN DETAILS (FOR COMPARISON)
		// =====================================================
		const currentPlan =
			await this.planRepository.findById(activePlanId);

		const newPlan =
			await this.planRepository.findById(newPlanId);

		if (!currentPlan || !newPlan) {
			throw new AppError("Plan not found", 404);
		}

		// =====================================================
		// CASE 3: DOWNGRADE → BLOCK
		// =====================================================
		if (newPlan.price < currentPlan.price) {
			throw new ValidationError("Downgrades are not allowed");
		}

		// =====================================================
		// CASE 4: SAME PRICE DIFFERENT PLAN → BLOCK
		// =====================================================
		if (newPlan.price === currentPlan.price && !samePlan) {
			throw new ValidationError("Plan already exists at same tier");
		}

		// =====================================================
		// CASE 5: UPGRADE
		// =====================================================
		const upgraded =
			await this.upgradeSubscription.execute({
				subscriptionId: activeSubscription.id,
				newPlanId: newPlanId,
				paymentId: payment.id
			});

		return {
			action: "upgraded",
			subscription: upgraded
		};
	}

	// =====================================================
	// HELPER
	// =====================================================
	_normalizeId(id) {
		if (!id) return null;
		if (typeof id === "object") {
			return (id._id || id.id)?.toString();
		}
		return id.toString();
	}
}