import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { PAYMENT_ACTIONS } from "../../../payment/domain/payment.enum.js";

export class InitiatePlanChange {
	constructor({ subscriptionRepository, planRepository, initiatePayment }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.initiatePayment = initiatePayment;
	}

	async execute({ userId, accountId, newPlanId, callbackUrl, ip = null }) {
		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (!subscription || subscription.status !== "active") {
			throw new ValidationError("No active subscription to change", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_ACTIVE);
		}

		const newPlan = await this.planRepository.findByIdOrNull(newPlanId);
		if (!newPlan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (!newPlan.isActive()) throw new ValidationError("This plan is not currently available");
		if (newPlan.serviceType !== subscription.serviceType) throw new ValidationError("New plan must match the account's service type");

		const newPrice = newPlan.getEffectivePrice();
		if (newPrice <= subscription.planSnapshot.price) {
			throw new ValidationError("Downgrading mid-cycle isn't supported — choose a new plan when your current subscription renews");
		}

		const result = await this.initiatePayment.execute({ userId, accountId, planId: newPlanId, callbackUrl, actionTypeOverride: PAYMENT_ACTIONS.UPGRADE, ip });
		return { type: "upgrade", ...result };
	}
}