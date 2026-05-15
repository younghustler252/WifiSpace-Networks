// modules/user/usecases/staff/impersonate-user.usecase.js
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ImpersonateUser {
	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Impersonate a user (allows a staff member to act as another user)
	 * @param {Object} actor - The staff member trying to impersonate the user
	 * @param {string} userId - The user to impersonate
	 * @returns {Promise<User>}
	 */
	async execute(actor, userId) {
		// Ensure actor is authorized to impersonate
		if (actor.role !== "staff" && actor.role !== "superadmin") {
			throw new UnauthorizedError("You are not authorized to impersonate users", "UNAUTHORIZED");
		}

		// Retrieve the user to impersonate
		const userToImpersonate = await this.userRepository.findById(userId);
		if (!userToImpersonate) {
			throw new ValidationError("User not found");
		}

		// Impersonation successful
		return userToImpersonate;
	}
}