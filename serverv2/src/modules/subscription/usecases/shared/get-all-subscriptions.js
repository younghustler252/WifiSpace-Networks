export class GetAllSubscriptionsUseCase {

	constructor({ accountSubscriptionRepository }) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({
		filter = {},
		page = 1,
		limit = 20,
		sort = { createdAt: -1 }
	} = {}) {

		const skip = (page - 1) * limit;

		const [subscriptions, total] = await Promise.all([
			this.accountSubscriptionRepository.findMany({
				filter,
				limit,
				skip,
				sort
			}),
			this.accountSubscriptionRepository.count(filter)
		]);

		return {
			data: subscriptions,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
}