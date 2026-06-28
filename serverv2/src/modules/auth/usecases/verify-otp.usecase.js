import { ValidationError } from "../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export class VerifyOtp {
	constructor({userRepository, auditService, tokenService, passwordService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
		this.tokenService = tokenService;
		this.passwordService = passwordService;
	}

	async execute({ email, otp, ip = null }) {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.isVerified) {
			throw new ValidationError("User already verified");
		}

		if (!user.verificationOTP) {
			throw new ValidationError("No OTP set. Please request a new one.");
		}

		user.unlockOTPIfExpired();

		if (user.otpAttempts === 0 && user.otpLockedUntil === null) {
			await this.userRepository.update(user.id, {
				otpAttempts: user.otpAttempts,
				otpLockedUntil: user.otpLockedUntil
			});
		}

		if (user.isOTPLocked()) {
			throw new ValidationError("Too many OTP attempts. Please try again later.");
		}

		if (user.isOTPExpired()) {
			throw new ValidationError("OTP expired. Please request a new code.");
		}

		const isValid = await this.passwordService.compare(otp.toString(), user.verificationOTP);

		if (!isValid) {
			user.incrementOTPAttempts();
			await this.userRepository.update(user.id, {
				otpAttempts: user.otpAttempts,
				otpLockedUntil: user.otpLockedUntil
			});
			throw new ValidationError("Invalid OTP");
		}

		user.verify();

		await this.userRepository.update(user.id, {
			isVerified: user.isVerified,
			verificationOTP: user.verificationOTP,
			otpExpiresAt: user.otpExpiresAt,
			otpAttempts: user.otpAttempts,
			otpLockedUntil: user.otpLockedUntil,
			lastOtpSentAt: user.lastOtpSentAt
		});

		const plainUser = typeof user.toObject === "function" ? user.toObject() : JSON.parse(JSON.stringify(user));
		
		// Ensure all possible identifier variants are mirrored onto the payload object safely
		plainUser.id = plainUser._id ? plainUser._id.toString() : plainUser.id;
		plainUser._id = plainUser.id;

		return {
			user,
			accessToken: this.tokenService.generateAccessToken(plainUser),
			refreshToken: this.tokenService.generateRefreshToken(plainUser)
		};
	}
}
