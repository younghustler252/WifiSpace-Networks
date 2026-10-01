import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";

export class ChangePlan {
	constructor({ subscriptionRepository, planRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, newPlanId, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		const newPlan = await this.planRepository.findByIdOrNull(newPlanId);
		if (!newPlan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (!newPlan.isActive()) throw new ValidationError("This plan is not currently available", SUBSCRIPTION_ERROR_CODES.PLAN_NOT_ACTIVE);
		if (newPlan.serviceType !== subscription.serviceType) {
			throw new ValidationError("New plan must match the account's service type", SUBSCRIPTION_ERROR_CODES.PLAN_SERVICE_TYPE_MISMATCH);
		}

		const previousPlanSnapshot = subscription.planSnapshot;

		subscription.planId = newPlanId;
		subscription.planSnapshot = {
			name: newPlan.name, serviceType: newPlan.serviceType, price: newPlan.getEffectivePrice(),
			durationValue: newPlan.durationValue, durationUnit: newPlan.durationUnit,
			speedRate: newPlan.speedRate, mikrotikProfile: newPlan.mikrotikProfile,
			devicesAllowed: newPlan.devicesAllowed, gracePeriodDays: newPlan.gracePeriodDays
		};
		subscription.recordEvent("manual_adjustment", { type: "plan_change", from: previousPlanSnapshot.name, to: newPlan.name });

		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		// Push the new profile to the router immediately if the subscription is currently active —
		// MikrotikManager.provision() already syncs routerProfile from planSnapshot.mikrotikProfile.
		if (updated.isActive()) {
			await this.networkService.activate(updated, {}).catch((err) =>
				console.error("[ChangePlan] Network re-provisioning failed:", err.message)
			);
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_PLAN_CHANGED", entity: "Subscription", entityId: subscription.id,
				oldValue: { plan: previousPlanSnapshot.name }, newValue: { plan: newPlan.name }, ip
			});
		}

		return updated;
	}
}