import { ValidationError } from "../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

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

		const activeSubscription =
			await this.subscriptionRepository.findActiveByAccount(
				account.id
			);

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

		const activePlanId =
			this._normalizeId(activeSubscription.planId);

		const requestedPlanId =
			this._normalizeId(plan.id || plan._id);

		if (activePlanId === requestedPlanId) {
			const subscription =
				await this.renewSubscription.execute({
					subscriptionId: activeSubscription.id,
					paymentId: payment.id,
					cycles: payment.cycles || 1
				});

			return {
				action: "renewed",
				subscription
			};
		}

		const currentPlan =
			await this.planRepository.findById(activePlanId);

		const newPlan =
			await this.planRepository.findById(requestedPlanId);

		if (!currentPlan || !newPlan) {
			throw new NotFoundError("Plan not found");
		}

		if (newPlan.price < currentPlan.price) {
			throw new ValidationError(
				"Downgrades are not allowed"
			);
		}

		if (
			newPlan.price === currentPlan.price
		) {
			throw new ValidationError(
				"Plan already exists at same tier"
			);
		}

		const subscription =
			await this.upgradeSubscription.execute({
				subscriptionId: activeSubscription.id,
				newPlanId: requestedPlanId,
				paymentId: payment.id
			});

		return {
			action: "upgraded",
			subscription
		};
	}

	_normalizeId(id) {
		if (!id) return null;

		if (typeof id === "object") {
			return (
				id._id ||
				id.id
			)?.toString();
		}

		return id.toString();
	}
}