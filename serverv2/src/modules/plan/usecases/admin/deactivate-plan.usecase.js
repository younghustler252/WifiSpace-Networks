import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PLAN_ERROR_CODES } from "../../domain/plan.enum.js";

export class DeactivatePlan {
	constructor({ planRepository, auditService }) {
		this.planRepository = planRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, planId, ip = null }) {
		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);

		plan.deactivate();
		const updated = await this.planRepository.update(planId, plan);

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "PLAN_DEACTIVATED", entity: "Plan", entityId: planId, ip });
		}

		return updated;
	}
}
