import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateSubscriptionUseCase {

	constructor({
		accountSubscriptionRepository,
		planRepository
	}) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({ accountId, planId }) {

		if (!accountId)
			throw new ValidationError("accountId is required");

		if (!planId)
			throw new ValidationError("planId is required");

		const existing =
			await this.accountSubscriptionRepository
				.findActiveByAccount(accountId);

		if (existing)
			throw new ValidationError(
				"Account already has an active subscription"
			);

		const plan = await this.planRepository.findById(planId);

		if (!plan)
			throw new NotFoundError("Plan not found");

		const startDate = new Date();

		const endDate = new Date();
		endDate.setDate(startDate.getDate() + plan.durationDays);

		return this.accountSubscriptionRepository.create({
			accountId,
			planId,
			startDate,
			endDate,
			status: "active"
		});
	}
}