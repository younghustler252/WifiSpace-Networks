// modules/user/usecases/admin/update-role.usecase.js

import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";
import { mapUserToDTO } from "../../domain/user-mapper.js";
import { PERMISSION } from "../../domain/permissions.js";

export class UpdateUserRole {
	constructor(userRepository, permissionService, auditService) {
		this.userRepository = userRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Execute updating user role
	 * @param {object} actor - The admin performing the action
	 * @param {string} userId - The user whose role is being updated
	 * @param {string} newRole - The new role to be assigned
	 * @returns {object} - Updated user mapped
	 */
	async execute(actor, userId, newRole) {
		// ----------------------------
		// 1️⃣ Check actor permission
		// ----------------------------
		const canUpdateRole = await this.permissionService.hasPermission(
			actor.id,
			PERMISSION.USER.UPDATE_ROLE
		);

		if (!canUpdateRole) {
			throw new UnauthorizedError("You do not have permission to update user role", "FORBIDDEN");
		}

		// ----------------------------
		// 2️⃣ Validate the new role
		// ----------------------------
		const validRoles = ["customer", "staff", "superadmin"];
		if (!validRoles.includes(newRole)) {
			throw new ValidationError("Invalid role provided");
		}

		// ----------------------------
		// 3️⃣ Find the user by ID
		// ----------------------------
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new ValidationError("User not found");
		}

		// ----------------------------
		// 4️⃣ Update user role
		// ----------------------------
		user.role = newRole;

		// Save updated user
		const updatedUser = await this.userRepository.update(user.id, { role: newRole });

		// ----------------------------
		// 5️⃣ Audit logging
		// ----------------------------
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "UPDATE_USER_ROLE",
				targetId: updatedUser.id,
				meta: { oldRole: user.role, newRole }
			});
		}

		// ----------------------------
		// 6️⃣ Return mapped user
		// ----------------------------
		return mapUserToDTO(updatedUser);
	}
}