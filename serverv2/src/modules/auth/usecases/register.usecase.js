// modules/auth/usecases/register.usecase.js
import { ValidationError } from "../../../shared/errors/validation-error.js";
import { User } from "../../user/domain/user.entity.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";

export class RegisterUser {
	constructor(userRepository, passwordService, auditService, mailService) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService; // optional for logging
		this.mailService = mailService;   // optional for verification email
	}

	async execute({ firstName, lastName, email, password, role = "customer", phone = null }) {
		// 1️⃣ Basic validation
		if (!email || !password || !firstName || !lastName) {
			throw new ValidationError("All required fields must be provided");
		}

		// 2️⃣ Check if user exists
		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new ValidationError("Email already registered");
		}

		// 3️⃣ Hash password
		const hashedPassword = await this.passwordService.hash(password);

		// 4️⃣ Generate verification token (for email verification)
		const verificationToken = Math.random().toString(36).substring(2, 12); // simple token for now

		// 5️⃣ Create user entity
		const user = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: "active",
			isVerified: false,
			phone,
			permissions: []
		});

		user.verificationToken = verificationToken;

		// 6️⃣ Persist user
		const createdUser = await this.userRepository.create(user);

		// 7️⃣ Audit log
		if (this.auditService) {
			await this.auditService.log({
				actorId: createdUser.id,
				action: "USER_REGISTER",
				meta: { email }
			});
		}

		// 8️⃣ Send verification email (stub for now)
		if (this.mailService) {
			await this.mailService.sendVerificationEmail({
				to: createdUser.email,
				token: verificationToken,
				name: createdUser.getFullName()
			});
		}

		// 9️⃣ Return safe user info
		return {
			id: createdUser.id,
			email: createdUser.email,
			firstName: createdUser.firstName,
			lastName: createdUser.lastName,
			role: createdUser.role,
			isVerified: createdUser.isVerified
		};
	}
}