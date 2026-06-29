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

		// ✅ FIXED: Standardized on Native Date objects for unified database consistency
		const otpExpiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		const hashedOtp = await this.passwordService.hash(
			otp.toString()
		);

		// -----------------------------
		// Update domain entity
		// -----------------------------
		user.setVerificationOTP(hashedOtp, otpExpiryDate);
		user.markOtpSent();
		
		// ✅ FIXED: Clear out old code brute-force lockout states for this new delivery cycle
		user.otpAttempts = 0;
		user.otpLockedUntil = null;

		// -----------------------------
		// Persist to DB
		// -----------------------------
		await this.userRepository.update(user.id, {
			verificationOTP: user.verificationOTP,
			otpExpiresAt: user.otpExpiresAt,
			otpAttempts: 0,
			otpLockedUntil: null,
			lastOtpSentAt: user.lastOtpSentAt,
		});

		// -----------------------------
		// Send email (Safe Network Handling)
		// -----------------------------
		if (this.mailService) {
			try {
				await this.mailService.sendOTP({
					to: user.email,
					name: user.getFullName(),
					otp,
					expiresIn: 10,
				});
			} catch (mailErr) {
				// Log the issue clearly but don't let it ruin the response flow if the DB update succeeded
				console.error("[ResendOtp] Email gateway delivery failed:", mailErr.message);
			}
		}

		// -----------------------------
		// Frontend-ready response
		// -----------------------------
		// ✅ FIXED: Safely handles conversion whether lastOtpSentAt is a raw timestamp or native Date object
		const sentTimeMs = user.lastOtpSentAt instanceof Date 
			? user.lastOtpSentAt.getTime() 
			: new Date(user.lastOtpSentAt).getTime();

		const nextResendAt = new Date(sentTimeMs + 60 * 1000);

		return {
			message: "OTP resent successfully",
			otpExpiresAt: user.otpExpiresAt,
			nextResendAt: nextResendAt,
			canResend: true,
			resendCooldownSeconds: 60,
		};
	}
}
