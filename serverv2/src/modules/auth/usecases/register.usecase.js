import { ValidationError, ConflictError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";
import { User } from "../../user/domain/user.entity.js";
import { USER_ROLE, USER_STATUS } from "../../user/domain/user.enum.js";

export class RegisterUser {
	constructor({ userRepository, passwordService, auditService, mailService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute({ firstName, lastName, email, password, role = USER_ROLE.CUSTOMER, phone = null, ip = null, userAgent = null }) {
		if (!email || !password || !firstName || !lastName) {
			throw new ValidationError("All required fields must be provided");
		}

		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new ConflictError("Email already registered", ERROR_CODES.EMAIL_ALREADY_REGISTERED);
		}

		const hashedPassword = await this.passwordService.hash(password);

		const otp = Math.floor(100000 + Math.random() * 900000);
		const hashedOtp = await this.passwordService.hash(otp.toString());
		const otpExpiryDate = new Date(Date.now() + 10 * 60 * 1000);

		const userEntity = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: USER_STATUS.ACTIVE,
			isVerified: false,
			phone,
			verificationOTP: hashedOtp,
			otpExpiresAt: otpExpiryDate
		});

		const createdUser = await this.userRepository.create(userEntity);

		if (this.auditService) {
			await this.auditService.log({
				actorId: createdUser.id,
				action: "USER_REGISTER",
				resource: "User",
				metadata: { email, ip, userAgent }
			}).catch((err) => console.error("AuditService failed:", err.message));
		}

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
			otpExpiresAt: createdUser.otpExpiresAt,
			mailError
		};
	}
}