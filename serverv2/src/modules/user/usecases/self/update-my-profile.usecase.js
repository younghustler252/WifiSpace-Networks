// modules/user/usecases/self/update-my-profile.usecase.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";

export class UpdateMyProfile {
	constructor({userRepository, auditService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ userId, profileData, ip = null }) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
		}

		const data = profileData || {};

		// Update entity safely
		user.updateProfile(data);

		// Persist changes
		await this.userRepository.update(user.id, {
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			nin: user.nin,
			address: user.address,
			gender: user.gender,
			dateOfBirth: user.dateOfBirth
		});

		// Audit
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "UPDATE_SELF_PROFILE",
				meta: {
					updatedFields: Object.keys(data),
					ip
				}
			});
		}

		return user;
	}
}