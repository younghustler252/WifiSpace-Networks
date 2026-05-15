
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";

export class ChangePassword {
	constructor(userRepository, passwordService, auditService) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ userId, oldPassword, newPassword, ip = null }) {
		const user = await this.userRepository.findAuthById(userId);

		if (!user) {
			throw new UnauthorizedError("User not found", "USER_NOT_FOUND");

		}
		// console.log("hashed password", user.hashedPassword);
		

		const isValid = await this.passwordService.compare(oldPassword, user.hashedPassword);
		if (!isValid) {
			throw new ValidationError("Old password is incorrect", "INVALID_OLD_PASSWORD");
		}

		if (!newPassword || newPassword.length < 6) {
			throw new ValidationError("Password must be at least 6 characters", "WEAK_PASSWORD");
		}

		if (oldPassword === newPassword) {
			throw new ValidationError("New password must be different", "PASSWORD_SAME");
		}

		const hashed = await this.passwordService.hash(newPassword);

		const passwordChangedAt = new Date();

		await this.userRepository.update(user.id, {
			hashedPassword: hashed,
			passwordChangedAt
		});
		// console.log("updated password", hashedPassword);
		

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