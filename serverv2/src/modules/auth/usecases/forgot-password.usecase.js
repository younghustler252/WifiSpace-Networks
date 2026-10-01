import { ValidationError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";

export class ForgotPassword {
	constructor({ userRepository, mailService, passwordService }) {
		this.userRepository = userRepository;
		this.mailService = mailService;
		this.passwordService = passwordService;
	}

	async execute({ email }) {
		const user = await this.userRepository.findAuthByEmail(email);

		// Same response whether or not the email exists — don't let this
		// endpoint be used to enumerate registered emails.
		if (!user) {
			return { message: "If that email exists, a reset code has been sent." };
		}

		if (!user.canResendResetPasswordOTP()) {
			throw new ValidationError("Please wait before requesting another reset code", ERROR_CODES.RESEND_COOLDOWN_ACTIVE);
		}

		const otp = Math.floor(100000 + Math.random() * 900000);
		const hashedOtp = await this.passwordService.hash(otp.toString());
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		user.setResetPasswordOTP(hashedOtp, expiresAt);
		user.markResetPasswordOtpSent();

		await this.userRepository.update(user.id, {
			resetPasswordOTP: user.resetPasswordOTP,
			resetPasswordOTPExpiresAt: user.resetPasswordOTPExpiresAt,
			resetPasswordAttempts: 0,
			resetPasswordOTPLockedUntil: null,
			lastResetPasswordOtpSentAt: user.lastResetPasswordOtpSentAt
		});

		if (this.mailService) {
			try {
				await this.mailService.sendPasswordResetOTP({
					to: user.email,
					name: user.getFullName(),
					otp,
					expiresIn: 10
				});
			} catch (err) {
				console.error("[ForgotPassword] Email delivery failed:", err.message);
			}
		}

		return { message: "If that email exists, a reset code has been sent." };
	}
}