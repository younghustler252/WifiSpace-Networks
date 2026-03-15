// modules/user/usecases/self/change-password.usecase.js

import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class ChangePassword {
	constructor(userRepository, passwordService, auditService) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ userId, oldPassword, newPassword, ip = null }) {
		const user = await this.userRepository.findAuthByEmail(userId);

		if (!user) throw new UnauthorizedError("User not found", "USER_NOT_FOUND");

		// Check old password
		const isValid = await this.passwordService.compare(oldPassword, user.password);
		if (!isValid) throw new ValidationError("Old password is incorrect", "INVALID_OLD_PASSWORD");

		// Hash new password
		const hashed = await this.passwordService.hash(newPassword);
		user.password = hashed;
		user.markPasswordChanged();

		// Persist
		await this.userRepository.update(user.id, {
			password: hashed,
			passwordChangedAt: user.passwordChangedAt
		});

		// Audit
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "CHANGE_PASSWORD",
				meta: { ip }
			});
		}

		return { message: "Password updated successfully" };
	}
}