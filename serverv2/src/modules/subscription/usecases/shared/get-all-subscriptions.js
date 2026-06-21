export class GetAllSubscriptionsUseCase {
	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({
		search,

		accountId,
		planId,

		status,
		mikrotikStatus,
		autoRenewEnabled,

		expiresFrom,
		expiresTo,

		page = 1,
		limit = 20,
		sort = { createdAt: -1 }
	} = {}) {

		const filter = {};

		if (accountId) {
			filter.accountId = accountId;
		}

		if (planId) {
			filter.planId = planId;
		}

		if (status) {
			filter.status = status;
		}

		if (mikrotikStatus) {
			filter.mikrotikStatus = mikrotikStatus;
		}

		if (typeof autoRenewEnabled === "boolean") {
			filter.autoRenewEnabled = autoRenewEnabled;
		}

		if (expiresFrom || expiresTo) {
			filter.expiresAt = {};

			if (expiresFrom) {
				filter.expiresAt.$gte = new Date(expiresFrom);
			}

			if (expiresTo) {
				filter.expiresAt.$lte = new Date(expiresTo);
			}
		}

		const skip = (page - 1) * limit;

		const [subscriptions, total] = await Promise.all([
			this.subscriptionRepository.findMany({
				filter,
				search,
				limit,
				skip,
				sort
			}),
			this.subscriptionRepository.count({
				filter,
				search
			})
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