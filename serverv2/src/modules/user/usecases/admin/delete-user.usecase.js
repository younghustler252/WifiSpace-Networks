import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_ROLE } from "../../domain/user.enum.js";

export class DeleteUser {
	constructor({ userRepository, auditService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, actorRole, targetId, ip = null }) {
		if (actorId === targetId) {
			throw new ForbiddenError("You cannot delete your own account", USER_ERROR_CODES.CANNOT_DELETE_SELF);
		}

		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (target.role === USER_ROLE.SUPERADMIN && actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can delete a superadmin", USER_ERROR_CODES.CANNOT_MODIFY_SUPERADMIN);
		}

		await this.userRepository.delete(targetId);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_DELETED", resource: "User",
				metadata: { targetId, targetEmail: target.email, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { message: "User deleted successfully" };
	}
}