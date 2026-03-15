// modules/user/usecases/admin/delete-user.usecase.js

import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class DeleteUser {
	constructor(userRepository, permissionService, auditService) {
		this.userRepository = userRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Execute delete user
	 * @param {object} actor - The admin performing the action
	 * @param {string} userId - The user to delete
	 * @returns {string} - Deletion status
	 */
	async execute(actor, userId) {
		// ----------------------------
		// 1️⃣ Check actor permission
		// ----------------------------
		const canDelete = await this.permissionService.hasPermission(
			actor.id,
			"user:delete_user"
		);

		if (!canDelete) {
			throw new UnauthorizedError("You do not have permission to delete a user", "FORBIDDEN");
		}

		// ----------------------------
		// 2️⃣ Find the user to delete
		// ----------------------------
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new ValidationError("User not found");
		}

		// ----------------------------
		// 3️⃣ Delete user from the repository
		// ----------------------------
		await this.userRepository.delete(userId);

		// ----------------------------
		// 4️⃣ Audit logging
		// ----------------------------
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "DELETE_USER",
				targetId: user.id,
				meta: { email: user.email, role: user.role }
			});
		}

		// ----------------------------
		// 5️⃣ Return success message
		// ----------------------------
		return "User deleted successfully";
	}
}