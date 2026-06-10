export class GetAllSubscriptionsUseCase {

	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({
		filter = {},
		page = 1,
		limit = 20,
		sort = { createdAt: -1 }
	} = {}) {

		const skip = (page - 1) * limit;

		const [subscriptions, total] = await Promise.all([
			this.subscriptionRepository.findMany({
				filter,
				limit,
				skip,
				sort
			}),
			this.subscriptionRepository.count(filter)
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