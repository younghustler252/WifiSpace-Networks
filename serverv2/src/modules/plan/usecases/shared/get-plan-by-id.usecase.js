import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PLAN_ERROR_CODES } from "../../domain/plan.enum.js";

export class GetPlanById {
	constructor({ planRepository }) {
		this.planRepository = planRepository;
	}

	async execute({ planId }) {
		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		return plan;
	}
}