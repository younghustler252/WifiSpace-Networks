// modules/user/usecases/admin/ban-user.usecase.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class BanUser {
	constructor({userRepository, permissionService, auditService}) {
		this.userRepository = userRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Execute ban user
	 * @param {object} actor - The admin performing the action
	 * @param {string} userId - The user to ban
	 * @returns {string} - Ban status
	 */
	async execute(actor, userId) {
		// ----------------------------
		// 1️⃣ Check actor permission
		// ----------------------------
		const canBan = await this.permissionService.hasPermission(
			actor.id,
			"user:ban_user"
		);

		if (!canBan) {
			throw new UnauthorizedError("You do not have permission to ban a user", "FORBIDDEN");
		}

		// ----------------------------
		// 2️⃣ Find the user to ban
		// ----------------------------
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new ValidationError("User not found");
		}

		// ----------------------------
		// 3️⃣ Ban the user
		// ----------------------------
		user.ban(); // Using the ban method from the User entity

		// Save updated user
		const updatedUser = await this.userRepository.update(user.id, { status: "banned" });

		// ----------------------------
		// 4️⃣ Audit logging
		// ----------------------------
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "BAN_USER",
				targetId: updatedUser.id,
				meta: { email: updatedUser.email, status: "banned" }
			});
		}

		// ----------------------------
		// 5️⃣ Return success message
		// ----------------------------
		return "User banned successfully";
	}
}