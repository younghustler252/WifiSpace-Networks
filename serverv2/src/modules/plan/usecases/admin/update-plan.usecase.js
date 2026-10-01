import { NotFoundError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { PLAN_ERROR_CODES } from "../../domain/plan.enum.js";
import { Plan } from "../../domain/plan.entity.js";

export class UpdatePlan {
	constructor({ planRepository, auditService }) {
		this.planRepository = planRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, planId, data, ip = null }) {
		const existingPlan = await this.planRepository.findByIdOrNull(planId);
		if (!existingPlan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);

		if (data.name && data.name.trim() !== existingPlan.name) {
			const conflict = await this.planRepository.findByNameAndServiceType(
				data.name.trim(),
				data.serviceType || existingPlan.serviceType
			);
			if (conflict) throw new ConflictError("A plan with this name already exists for this service type", PLAN_ERROR_CODES.PLAN_NAME_CONFLICT);
		}

		// Re-validate the merged result through the entity, so a partial update can never leave the plan in an invalid state.
		const merged = new Plan({ ...existingPlan, ...data, id: existingPlan.id });

		const updated = await this.planRepository.update(planId, merged);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "PLAN_UPDATED", entity: "Plan", entityId: planId,
				oldValue: existingPlan.toJSON(), newValue: data, ip
			});
		}

		return updated;
	}
}