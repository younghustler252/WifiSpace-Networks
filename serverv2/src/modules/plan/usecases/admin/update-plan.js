
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class UpdatePlan {

	constructor({planRepository, permissionService}) {
		this.planRepository = planRepository;
	}

	async execute(planId, data) {

		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		return this.planRepository.update(planId, data);
	}
}