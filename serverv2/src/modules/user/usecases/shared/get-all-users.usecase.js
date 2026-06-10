export class GetAllUsers {
	constructor({userRepository}) {
		this.userRepository = userRepository;
	}

	async execute(params = {}) {
		const {
			status,
			role,
			search,
			sort = "az", // az | za | newest | oldest
			skip = 0,
			limit = 50,
			currentUser
		} = params;

		if (!currentUser) {
			throw new Error("Unauthorized");
		}

		// ----------------------------
		// FILTER
		// ----------------------------
		const filter = {};

		if (status) {
			filter.status = status;
		}

		if (role) {
			filter.role = role;
		}

		// ----------------------------
		// ROLE-BASED ACCESS
		// ----------------------------
		if (currentUser.role === "staff") {
			if (filter.role) {
				filter.role = { $eq: filter.role, $ne: "superadmin" };
			} else {
				filter.role = { $ne: "superadmin" };
			}
		}

		// ----------------------------
		// SEARCH (SAFE REGEX)
		// ----------------------------
		if (search) {
			const escapeRegex = (text) =>
				text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

			const safeSearch = escapeRegex(search);

			filter.$or = [
				{ firstName: { $regex: safeSearch, $options: "i" } },
				{ lastName: { $regex: safeSearch, $options: "i" } },
				{ email: { $regex: safeSearch, $options: "i" } }
			];
		}

		// ----------------------------
		// PAGINATION SAFETY
		// ----------------------------
		const safeLimit = Math.min(Number(limit) || 50, 100);
		const safeSkip = Math.max(Number(skip) || 0, 0);

		// ----------------------------
		// SORTING (SIMPLE + SAFE)
		// ----------------------------
		const sortOptions = {
			az: { firstName: 1, lastName: 1 },
			za: { firstName: -1, lastName: -1 },
			newest: { createdAt: -1 },
			oldest: { createdAt: 1 }
		};

		const safeSort = sortOptions[sort] || sortOptions.az;

		// ----------------------------
		// QUERY
		// ----------------------------
		return this.userRepository.findAll(
			filter,
			safeSort,
			safeSkip,
			safeLimit
		);
	}
}