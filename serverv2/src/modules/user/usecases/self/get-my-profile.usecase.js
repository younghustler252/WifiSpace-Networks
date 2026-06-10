// modules/user/usecases/self/get-my-profile.usecase.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
export class GetMyProfile {
	constructor({userRepository, auditService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	
	async execute({ userId, ip = null }) {
		// 1️⃣ Fetch user entity
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
		}

		// 2️⃣ Log audit
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "VIEW_SELF_PROFILE",
				meta: { ip }
			});
		}

		// 3️⃣ Return safe user data
		return user;
	}
}