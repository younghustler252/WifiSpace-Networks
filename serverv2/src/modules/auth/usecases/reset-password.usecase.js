import { ValidationError, NotFoundError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";

export class ResetPassword {
	constructor({ userRepository, passwordService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ email, otp, newPassword, ip = null }) {
		
		const user = await this.userRepository.findAuthByEmail(email);

		if (!user) throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
		if (!user.resetPasswordOTP) throw new ValidationError("No reset code requested. Please request a new one.", ERROR_CODES.RESET_OTP_NOT_SET);
		if (user.isResetPasswordOTPLocked()) throw new ValidationError("Too many attempts. Please request a new code.", ERROR_CODES.RESET_OTP_LOCKED);
		if (user.isResetPasswordOTPExpired()) throw new ValidationError("Reset code expired. Please request a new one.", ERROR_CODES.RESET_OTP_EXPIRED);

		const isValid = await this.passwordService.compare(otp.toString(), user.resetPasswordOTP);

		if (!isValid) {
			user.incrementResetPasswordAttempts();
			await this.userRepository.update(user.id, {
				resetPasswordAttempts: user.resetPasswordAttempts,
				resetPasswordOTPLockedUntil: user.resetPasswordOTPLockedUntil
			});
			throw new ValidationError("Invalid reset code", ERROR_CODES.RESET_OTP_INVALID);
		}

		const hashedPassword = await this.passwordService.hash(newPassword);
		user.resetPassword(hashedPassword);

		await this.userRepository.update(user.id, {
			hashedPassword: user.hashedPassword,
			passwordChangedAt: user.passwordChangedAt,
			resetPasswordOTP: null,
			resetPasswordOTPExpiresAt: null,
			resetPasswordAttempts: 0,
			resetPasswordOTPLockedUntil: null,
			failedLoginAttempts: 0,
			lockUntil: null
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "PASSWORD_RESET",
				resource: "User",
				metadata: { ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { message: "Password reset successfully. Please log in with your new password." };
	}
}