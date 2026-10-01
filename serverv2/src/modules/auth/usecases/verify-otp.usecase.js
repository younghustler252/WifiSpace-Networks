import { ValidationError, NotFoundError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";

export class VerifyOtp {
	constructor({ userRepository, auditService, tokenService, passwordService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
		this.tokenService = tokenService;
		this.passwordService = passwordService;
	}

	async execute({ email, otp, ip = null }) {
		const user = await this.userRepository.findByEmail(email);

		if (!user) throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
		if (user.isVerified) throw new ValidationError("User already verified", ERROR_CODES.USER_ALREADY_VERIFIED);
		if (!user.verificationOTP) throw new ValidationError("No OTP set. Please request a new one.", ERROR_CODES.OTP_NOT_SET);

		user.unlockOTPIfExpired();

		if (user.isOTPLocked()) throw new ValidationError("Too many OTP attempts. Please try again later.", ERROR_CODES.OTP_LOCKED);
		if (user.isOTPExpired()) throw new ValidationError("OTP expired. Please request a new code.", ERROR_CODES.OTP_EXPIRED);

		const isValid = await this.passwordService.compare(otp.toString(), user.verificationOTP);

		if (!isValid) {
			user.incrementOTPAttempts();
			await this.userRepository.update(user.id, {
				otpAttempts: user.otpAttempts,
				otpLockedUntil: user.otpLockedUntil
			});
			throw new ValidationError("Invalid OTP", ERROR_CODES.OTP_INVALID);
		}

		user.verify();

		await this.userRepository.update(user.id, {
			isVerified: true,
			verificationOTP: null,
			otpExpiresAt: null,
			otpAttempts: 0,
			otpLockedUntil: null,
			lastOtpSentAt: user.lastOtpSentAt
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "OTP_VERIFIED",
				resource: "User",
				metadata: { ip }
			}).catch((err) => console.error("Verification audit failed:", err.message));
		}

		return {
			user,
			accessToken: this.tokenService.generateAccessToken(user),
			refreshToken: this.tokenService.generateRefreshToken(user)
		};
	}
}