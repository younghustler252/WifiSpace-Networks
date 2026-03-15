// modules/user/usecases/shared/get-all-users.usecase.js
import { UserRepository } from "../../domain/user.repository.js";

export class GetAllUsers {
	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Fetch all users, supporting filters (e.g., status, role)
	 * @param {Object} filter - The filter to apply (e.g., { status: "active" })
	 * @param {number} skip - The number of records to skip (pagination)
	 * @param {number} limit - The number of records to return
	 * @returns {Promise<Array<User>>}
	 */
	async execute(filter = {}, skip = 0, limit = 50) {
		// Filter users by status, role, etc.
		const users = await this.userRepository.findAll(filter, skip, limit);
		return users;
	}
}