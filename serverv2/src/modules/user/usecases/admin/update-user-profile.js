// modules/user/usecases/admin/update-user-profile.usecase.js

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";

export class UpdateUserProfile {
	constructor({userRepository, auditService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	/**
	 * @param {Object} params
	 * @param {string} params.userId - The ID of the user to update
	 * @param {Object} params.profileData - The fields to update
	 * @param {string} [params.actorId] - Who is performing the update (for audit)
	 * @param {string} [params.ip] - Optional IP address
	 */
	async execute({ userId, profileData, actorId = null, ip = null }) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError("User not found", "USER_NOT_FOUND");
		}

		const data = profileData || {};

		// Update entity safely, only allowed fields
		user.updateProfile(data);

		// Persist changes (do not update role/status here)
		await this.userRepository.update(user.id, {
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			address: user.address,
			gender: user.gender,
			dateOfBirth: user.dateOfBirth,
			theme: user.theme,
		});

		// Audit the change
		if (this.auditService) {
			await this.auditService.log({
				actorId,
				action: "UPDATE_USER_PROFILE",
				targetId: user.id,
				meta: {
					updatedFields: Object.keys(data),
					ip,
				},
			});
		}

		return user;
	}
}