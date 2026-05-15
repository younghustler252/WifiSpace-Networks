import { PERMISSION } from "../../../../shared/constants/permissions.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class DeletePlan {

	constructor(planRepository, permissionService, auditService) {
		this.planRepository = planRepository;
		this.auditService = auditService;
	}

	async execute(currentUser, planId, context = {}) {

		// ----------------------------
		// Fetch Plan
		// ----------------------------

		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		// ----------------------------
		// Business Rule (based on your model)
		// ----------------------------

		if (plan.status === "active") {
			throw new ValidationError(
				"Active plan cannot be deleted. Deactivate it first."
			);
		}

		// ----------------------------
		// Delete (hard delete)
		// ----------------------------

		await this.planRepository.delete(planId);

		// ----------------------------
		// Audit Log
		// ----------------------------

		await this.auditService.log({
			actorId: currentUser.id,
			action: "PLAN_DELETED",
			targetId: planId,
			resource: "Plan",
			metadata: {
				name: plan.name,
				type: plan.type,
				price: plan.price
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return { success: true };
	}
}