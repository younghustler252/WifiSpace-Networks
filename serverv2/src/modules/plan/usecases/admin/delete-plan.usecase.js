import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { PLAN_ERROR_CODES, PLAN_STATUSES } from "../../domain/plan.enum.js";

export class DeletePlan {
	constructor({ planRepository, auditService }) {
		this.planRepository = planRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, planId, ip = null }) {
		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);

		if (plan.status === PLAN_STATUSES.ACTIVE) {
			throw new ValidationError("Active plan cannot be deleted. Deactivate it first.", PLAN_ERROR_CODES.CANNOT_DELETE_ACTIVE_PLAN);
		}

		await this.planRepository.update(planId, { ...plan, deletedAt: new Date() });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "PLAN_DELETED", entity: "Plan", entityId: planId,
				oldValue: { name: plan.name, price: plan.price }, ip
			});
		}

		return { message: "Plan deleted successfully" };
	}
}