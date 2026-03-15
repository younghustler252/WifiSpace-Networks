import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class UpgradeSubscriptionUseCase {

	constructor({
		accountSubscriptionRepository,
		planRepository
	}) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({ accountId, newPlanId }) {

		const active =
			await this.accountSubscriptionRepository
				.findActiveByAccount(accountId);

		if (!active)
			throw new NotFoundError("Active subscription not found");

		const newPlan = await this.planRepository.findById(newPlanId);

		if (!newPlan)
			throw new NotFoundError("Plan not found");

		const currentPlan = active.planId;

		if (newPlan.price <= currentPlan.price)
			throw new ValidationError(
				"New plan must be higher than current plan"
			);

		await this.accountSubscriptionRepository.updateStatus(
			active.id,
			"expired"
		);

		const startDate = new Date();

		const endDate = new Date();
		endDate.setDate(startDate.getDate() + newPlan.durationDays);

		return this.accountSubscriptionRepository.create({
			accountId,
			planId: newPlanId,
			startDate,
			endDate,
			status: "active"
		});
	}
}