import { ValidationError, NotFoundError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";

export class ResendOtp {
	constructor({ userRepository, mailService, passwordService }) {
		this.userRepository = userRepository;
		this.mailService = mailService;
		this.passwordService = passwordService;
	}

	async execute({ email }) {
		const user = await this.userRepository.findByEmail(email);

		if (!user) throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
		if (user.isVerified) throw new ValidationError("User already verified", ERROR_CODES.USER_ALREADY_VERIFIED);
		if (!user.canResendOTP()) throw new ValidationError("Please wait before requesting another OTP", ERROR_CODES.RESEND_COOLDOWN_ACTIVE);

		const otp = Math.floor(100000 + Math.random() * 900000);
		const otpExpiryDate = new Date(Date.now() + 10 * 60 * 1000);
		const hashedOtp = await this.passwordService.hash(otp.toString());

		user.setVerificationOTP(hashedOtp, otpExpiryDate);
		user.markOtpSent();

		await this.userRepository.update(user.id, {
			verificationOTP: user.verificationOTP,
			otpExpiresAt: user.otpExpiresAt,
			otpAttempts: 0,
			otpLockedUntil: null,
			lastOtpSentAt: user.lastOtpSentAt
		});

		if (this.mailService) {
			try {
				await this.mailService.sendOTP({
					to: user.email,
					name: user.getFullName(),
					otp,
					expiresIn: 10
				});
			} catch (mailErr) {
				console.error("[ResendOtp] Email gateway delivery failed:", mailErr.message);
			}
		}

		return {
			message: "OTP resent successfully",
			otpExpiresAt: user.otpExpiresAt,
			nextResendAt: new Date(user.lastOtpSentAt + 60 * 1000),
			resendCooldownSeconds: 60
		};
	}
}