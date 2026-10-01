import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_ROLE } from "../../domain/user.enum.js";

export class UpdateRole {
	constructor({ userRepository, auditService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, actorRole, targetId, role, ip = null }) {
		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can change roles", USER_ERROR_CODES.CANNOT_MODIFY_SUPERADMIN);
		}

		const updated = await this.userRepository.update(targetId, { role });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_ROLE_UPDATED", resource: "User",
				metadata: { targetId, fromRole: target.role, toRole: role, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return updated;
	}
}