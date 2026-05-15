import { ValidationError } from "../../../shared/errors/validation-error.js";
import { User } from "../../user/domain/user.entity.js";

export class RegisterUser {
	constructor(userRepository, passwordService, auditService, mailService , tokenService) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.mailService = mailService;
		this.tokenService = tokenService; 
	}

	async execute({ firstName, lastName, email, password, role = "customer", phone = null, ip = null, userAgent = null }) {
		
		if (!email || !password || !firstName || !lastName) {
			throw new ValidationError("All required fields must be provided");
		}


		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new ValidationError("Email already registered");
		}

		const hashedPassword = await this.passwordService.hash(password);

		const otp = Math.floor(100000 + Math.random() * 900000);
		const hashedOtp = await this.passwordService.hash(otp.toString());

		// 5️⃣ Create user entity
		const userEntity = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: "active",
			isVerified: false,
			phone,
			permissions: [],
			verificationOTP: otp,
			otpExpiresAt
		});

		// 6️⃣ Persist user
		const createdUser = await this.userRepository.create(userEntity);

		// 7️⃣ Audit log (safe)
		if (this.auditService) {
			try {
				await this.auditService.log({
					actorId: createdUser.id,
					action: "USER_REGISTER",
					resource: "User",
					metadata: { email, ip, userAgent }
				});
			} catch (err) {
				console.error("AuditService failed:", err);
			}
		}

		// 8️⃣ Send OTP email (safe)
		let verificationSent = false;
		let mailError = null;

		if (this.mailService) {
			try {
				await this.mailService.sendOTP({
					to: createdUser.email,
					name: createdUser.getFullName(),
					otp,
					expiresIn: 10
				});
				verificationSent = true;
			} catch (err) {
				mailError = err.message || "Failed to send verification email";
				console.error("MailService failed:", err);
			}
		}

		return {
			id: createdUser.id,
			email: createdUser.email,
			firstName: createdUser.firstName,
			lastName: createdUser.lastName,
			role: createdUser.role,
			isVerified: createdUser.isVerified,
			verificationSent,
			mailError // null if sent successfully
		};
	}
}