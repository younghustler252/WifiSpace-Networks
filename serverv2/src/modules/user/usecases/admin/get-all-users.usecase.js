import { UnauthorizedError, ERROR_CODES } from "../../../../shared/errors/domain.errors.js";
import { USER_ROLE } from "../../domain/user.enum.js";

const SORT_OPTIONS = {
	az: { firstName: 1, lastName: 1 },
	za: { firstName: -1, lastName: -1 },
	newest: { createdAt: -1 },
	oldest: { createdAt: 1 }
};

function escapeRegex(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class GetAllUsers {
	constructor({ userRepository }) {
		this.userRepository = userRepository;
	}

	async execute({ actorRole, status, role, search, sort = "az", page = 1, limit = 20 } = {}) {
		if (!actorRole) throw new UnauthorizedError("Authentication required", ERROR_CODES.UNAUTHORIZED);

		const filter = {};
		if (status) filter.status = status;
		if (role) filter.role = role;

		if (actorRole === USER_ROLE.STAFF) {
			filter.role = role
				? { $eq: role, $ne: USER_ROLE.SUPERADMIN }
				: { $ne: USER_ROLE.SUPERADMIN };
		}

		if (search) {
			const safeSearch = escapeRegex(search);
			filter.$or = [
				{ firstName: { $regex: safeSearch, $options: "i" } },
				{ lastName: { $regex: safeSearch, $options: "i" } },
				{ email: { $regex: safeSearch, $options: "i" } }
			];
		}

		return this.userRepository.paginate({
			filter,
			page,
			limit,
			sort: SORT_OPTIONS[sort] || SORT_OPTIONS.az
		});
	}
}