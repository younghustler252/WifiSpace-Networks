import PERMISSION from "../../../../shared/constants/permissions.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class UpdatePlan {

	constructor(planRepository, permissionService) {
		this.planRepository = planRepository;
		this.permissionService = permissionService;
	}

	async execute(currentUser, planId, data) {

		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.PLAN.UPDATE
		);

		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		return this.planRepository.update(planId, data);
	}
}