// modules/user/usecases/staff/search-user.usecase.js
import { UserRepository } from "../../domain/user.repository.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";

export class SearchUser {
	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Search for users by query (used by staff to search users in the system)
	 * @param {Object} actor - The staff member performing the search
	 * @param {string} query - Search query (can be name, email, etc.)
	 * @returns {Promise<Array<User>>}
	 */
	async execute(actor, query) {
		// Ensure actor has permissions to search
		if (actor.role !== "staff" && actor.role !== "superadmin") {
			throw new UnauthorizedError("You are not authorized to search users", "UNAUTHORIZED");
		}

		// Search users based on the query (could be more advanced)
		const users = await this.userRepository.searchUsers(query);
		return users;
	}
}