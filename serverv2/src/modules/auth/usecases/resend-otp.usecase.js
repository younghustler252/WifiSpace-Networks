import { ValidationError } from "../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export class ResendOtp {
	constructor({
		userRepository,
		mailService,
		passwordService,
	}) {
		this.userRepository = userRepository;
		this.mailService = mailService;
		this.passwordService = passwordService;
	}

	async execute({ email }) {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.isVerified) {
			throw new ValidationError("User already verified");
		}

		// -----------------------------
		// OTP cooldown enforcement
		// -----------------------------
		if (!user.canResendOTP()) {
			throw new ValidationError(
				"Please wait before requesting another OTP"
			);
		}

		// -----------------------------
		// Generate OTP
		// -----------------------------
		const otp = Math.floor(
			100000 + Math.random() * 900000
		);

		const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

		const hashedOtp = await this.passwordService.hash(
			otp.toString()
		);

		// -----------------------------
		// Update domain entity
		// -----------------------------
		user.setVerificationOTP(hashedOtp, otpExpiresAt);
		user.markOtpSent();

		// -----------------------------
		// Persist to DB
		// -----------------------------
		await this.userRepository.update(user.id, {
			verificationOTP: user.verificationOTP,
			otpExpiresAt: user.otpExpiresAt,
			otpAttempts: user.otpAttempts,
			otpLockedUntil: user.otpLockedUntil,
			lastOtpSentAt: user.lastOtpSentAt,
		});

		// -----------------------------
		// Send email
		// -----------------------------
		await this.mailService.sendOTP({
			to: user.email,
			name: user.getFullName(),
			otp,
			expiresIn: 10,
		});

		// -----------------------------
		// Frontend-ready response
		// -----------------------------
		const nextResendAt = user.lastOtpSentAt + 60 * 1000;

		return {
			message: "OTP resent successfully",
			otpExpiresAt,
			nextResendAt,
			canResend: true,
			resendCooldownSeconds: 60,
		};
	}
}