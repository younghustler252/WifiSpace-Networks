import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_ROLE } from "../../domain/user.enum.js";

export class ImpersonateUser {
	constructor({ userRepository, tokenService, auditService }) {
		this.userRepository = userRepository;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ actorId, actorRole, targetId, ip = null }) {
		if (actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can impersonate users", USER_ERROR_CODES.IMPERSONATION_NOT_ALLOWED);
		}
		if (actorId === targetId) {
			throw new ForbiddenError("You cannot impersonate yourself", USER_ERROR_CODES.IMPERSONATION_NOT_ALLOWED);
		}

		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (target.role === USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Cannot impersonate another superadmin", USER_ERROR_CODES.IMPERSONATION_NOT_ALLOWED);
		}

		const accessToken = this.tokenService.generateAccessToken(target, { impersonatedBy: actorId });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_IMPERSONATED", resource: "User",
				metadata: { targetId, targetEmail: target.email, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { accessToken, impersonating: target.toJSON() };
	}
}