import { ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_STATUS } from "../../domain/user.enum.js";
import { User } from "../../domain/user.entity.js";

export class CreateUser {
	constructor({ userRepository, passwordService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ actorId, firstName, lastName, email, password, role, phone = null, ip = null }) {
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");
		if (!email) throw new ValidationError("Email is required");
		if (!password) throw new ValidationError("Password is required");

		const existing = await this.userRepository.findByEmail(email);
		if (existing) throw new ConflictError("Email already in use", USER_ERROR_CODES.EMAIL_ALREADY_IN_USE);

		const hashedPassword = await this.passwordService.hash(password);

		const userEntity = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: USER_STATUS.ACTIVE,
			isVerified: true, // admin-created accounts skip OTP verification
			phone
		});

		const createdUser = await this.userRepository.create(userEntity);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_CREATED_BY_ADMIN", resource: "User",
				metadata: { targetId: createdUser.id, role: createdUser.role, email: createdUser.email, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return createdUser;
	}
}