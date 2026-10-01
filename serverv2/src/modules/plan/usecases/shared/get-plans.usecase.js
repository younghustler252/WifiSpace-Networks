const SORT_OPTIONS = {
	price_asc: { price: 1 },
	price_desc: { price: -1 },
	newest: { createdAt: -1 }
};

export class GetPlans {
	constructor({ planRepository }) {
		this.planRepository = planRepository;
	}

	async execute({ scope = "public", serviceType, accountType, status, sort = "newest", page = 1, limit = 20 } = {}) {
		const filter = {};

		if (serviceType) filter.serviceType = serviceType;
		if (accountType) filter.accountType = accountType;

		if (scope === "public") {
			filter.status = "active"; // customers never see inactive/draft plans
		} else if (status) {
			filter.status = status; // admin scope can filter by status explicitly
		}

		return this.planRepository.paginate({
			filter,
			page,
			limit,
			sort: SORT_OPTIONS[sort] || SORT_OPTIONS.newest
		});
	}
}