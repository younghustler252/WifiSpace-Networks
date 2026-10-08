const SORT_OPTIONS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, expiring_soon: { expiresAt: 1 } };

export class GetAllSubscriptions {
	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ status, accountId, userId, mikrotikStatus, sort = "newest", page = 1, limit = 20 } = {}) {
		const filter = {};
		if (status) filter.status = status;
		if (accountId) filter.accountId = accountId;
		if (userId) filter.userId = userId;
		if (mikrotikStatus) filter.mikrotikStatus = mikrotikStatus;

		return this.subscriptionRepository.paginate({ filter, page, limit, sort: SORT_OPTIONS[sort] || SORT_OPTIONS.newest });
	}
}