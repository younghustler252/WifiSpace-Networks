// modules/user/usecases/admin/update-role.usecase.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ROLE_PERMISSIONS } from "../../../../shared/constants/roles.js";

export class UpdateRole {
	constructor({userRepository, permissionService, auditService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute(actor, userId, newRole) {
		
		// Prevent self-role update (optional but recommended)
		if (actor.id === userId) {
			throw new ValidationError("You cannot change your own role");
		}

		// Validate role
		const validRoles = ["customer", "staff", "superadmin"];
		if (!validRoles.includes(newRole)) {
			throw new ValidationError("Invalid role provided");
		}

		// Find user
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new ValidationError("User not found");
		}

		const oldRole = user.role;

		// Update role
		const updatedUser = await this.userRepository.update(user.id, {
			role: newRole,
			permissions: ROLE_PERMISSIONS[newRole] || []
		});

		// Audit log
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "UPDATE_USER_ROLE",
				targetId: updatedUser.id,
				meta: { oldRole, newRole }
			});
		}

		return updatedUser;
	}
}