import { ValidationError, NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class ChangePassword {
	constructor({ userRepository, passwordService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ userId, oldPassword, newPassword, ip = null }) {
		const user = await this.userRepository.findAuthById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		const isValid = await this.passwordService.compare(oldPassword, user.hashedPassword);
		if (!isValid) throw new ValidationError("Old password is incorrect", USER_ERROR_CODES.INVALID_OLD_PASSWORD);

		if (!newPassword || newPassword.length < 8) {
			throw new ValidationError("Password must be at least 8 characters", USER_ERROR_CODES.WEAK_PASSWORD);
		}

		if (oldPassword === newPassword) {
			throw new ValidationError("New password must be different from the old one", USER_ERROR_CODES.PASSWORD_SAME_AS_OLD);
		}

		user.hashedPassword = await this.passwordService.hash(newPassword);
		user.markPasswordChanged();

		await this.userRepository.update(user.id, {
			hashedPassword: user.hashedPassword,
			passwordChangedAt: user.passwordChangedAt
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id, action: "PASSWORD_CHANGED", resource: "User", metadata: { ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { message: "Password updated successfully" };
	}
}