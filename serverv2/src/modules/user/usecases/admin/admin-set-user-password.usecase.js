import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_ROLE } from "../../domain/user.enum.js";

export class AdminSetUserPassword {
	constructor({ userRepository, passwordService, auditService, mailService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute({ actorId, actorRole, targetId, newPassword, ip = null }) {
		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (target.role === USER_ROLE.SUPERADMIN && actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can reset a superadmin's password", USER_ERROR_CODES.CANNOT_MODIFY_SUPERADMIN);
		}

		const hashedPassword = await this.passwordService.hash(newPassword);

		await this.userRepository.update(targetId, {
			hashedPassword,
			passwordChangedAt: new Date(),
			failedLoginAttempts: 0,
			lockUntil: null
		});

		if (this.mailService) {
			this.mailService.sendPasswordChangedNotice({ to: target.email, name: target.getFullName() })
				.catch((err) => console.error("[AdminSetUserPassword] Notice email failed:", err.message));
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_PASSWORD_RESET_BY_ADMIN", resource: "User", metadata: { targetId, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { message: "Password updated successfully" };
	}
}