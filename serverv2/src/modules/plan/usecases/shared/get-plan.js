import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class GetPlanById {

	constructor(planRepository) {
		this.planRepository = planRepository;
	}

	async execute(planId) {

		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		return plan;
	}
}