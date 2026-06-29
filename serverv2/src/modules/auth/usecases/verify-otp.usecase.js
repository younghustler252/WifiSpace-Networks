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

		// Sync code lockouts in memory first
		user.unlockOTPIfExpired();

		if (user.isOTPLocked()) {
			throw new ValidationError("Too many OTP attempts. Please try again later.");
		}

		if (user.isOTPExpired()) {
			throw new ValidationError("OTP expired. Please request a new code.");
		}

		const isValid = await this.passwordService.compare(otp.toString(), user.verificationOTP);

		if (!isValid) {
			user.incrementOTPAttempts();
			
			// Persist the lock/attempt state on failure
			await this.userRepository.update(user.id, {
				otpAttempts: user.otpAttempts,
				otpLockedUntil: user.otpLockedUntil
			});
			throw new ValidationError("Invalid OTP");
		}

		// ✅ Mutates entity memory state: sets isVerified=true, clear OTP values to prevent reuse
		user.verify();

		// ✅ FIXED: Explicitly map all attributes including null values to clear them from database storage completely
		await this.userRepository.update(user.id, {
			isVerified: true,
			verificationOTP: null,     // Overwrite old hash values securely
			otpExpiresAt: null,        // Overwrite expiry timestamps securely
			otpAttempts: 0,
			otpLockedUntil: null,
			lastOtpSentAt: user.lastOtpSentAt
		});

		// Create safe object formatting payload matching your architecture profile
		const plainUser = typeof user.toObject === "function" ? user.toObject() : JSON.parse(JSON.stringify(user));
		plainUser.id = plainUser._id ? plainUser._id.toString() : plainUser.id;
		plainUser._id = plainUser.id;

		// Audit Log Tracking Hook
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
			accessToken: this.tokenService.generateAccessToken(plainUser),
			refreshToken: this.tokenService.generateRefreshToken(plainUser)
		};
	}
}
