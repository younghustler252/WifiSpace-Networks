const SORT_OPTIONS = {
	newest: { createdAt: -1 },
	oldest: { createdAt: 1 }
};

function escapeRegex(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class GetAllAccounts {
	constructor({ accountRepository }) {
		this.accountRepository = accountRepository;
	}

	async execute({ serviceType, accountType, status, approvalStatus, search, sort = "newest", page = 1, limit = 20 } = {}) {
		const filter = {};

		if (serviceType) filter.serviceType = serviceType;
		if (accountType) filter.accountType = accountType;
		if (status) filter.status = status;
		if (approvalStatus) filter.approvalStatus = approvalStatus;

		if (search) {
			const safeSearch = escapeRegex(search);
			filter.$or = [
				{ wsnId: { $regex: safeSearch, $options: "i" } },
				{ businessName: { $regex: safeSearch, $options: "i" } }
			];
		}

		return this.accountRepository.paginate({
			filter,
			page,
			limit,
			sort: SORT_OPTIONS[sort] || SORT_OPTIONS.newest
		});
	}
}