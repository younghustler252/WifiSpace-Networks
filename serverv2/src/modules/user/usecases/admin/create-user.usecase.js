// modules/user/usecases/admin/create-user.usecase.js

import { User } from "../../domain/user.entity.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { mapUserToDTO } from "../../domain/user-mapper.js";
import { PERMISSION } from "../../domain/permissions.js";

export class CreateUser {
	constructor(userRepository, passwordService, auditService, permissionService) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.permissionService = permissionService;
	}

	/**
	 * Execute create user
	 * @param {object} actor - The admin performing the action
	 * @param {object} userData - Data for the new user
	 * @returns {object} - Created user mapped
	 */
	async execute(actor, userData) {
		// ----------------------------
		// 1️⃣ Check actor permission
		// ----------------------------
		const canCreate = await this.permissionService.hasPermission(
			actor.id,
			PERMISSION.USER.FULL_ACCESS
		);

		if (!canCreate) {
			throw new UnauthorizedError("You do not have permission to create a user", "FORBIDDEN");
		}

		// ----------------------------
		// 2️⃣ Validate required fields
		// ----------------------------
		const { firstName, lastName, email, password, role = "customer" } = userData;
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");
		if (!email) throw new ValidationError("Email is required");
		if (!password) throw new ValidationError("Password is required");

		// ----------------------------
		// 3️⃣ Check if email already exists
		// ----------------------------
		const existing = await this.userRepository.findByEmail(email);
		if (existing) throw new ValidationError("Email already in use");

		// ----------------------------
		// 4️⃣ Hash password
		// ----------------------------
		const hashedPassword = await this.passwordService.hash(password);

		// ----------------------------
		// 5️⃣ Create User entity
		// ----------------------------
		const userEntity = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: "active",
			isVerified: false
		});

		// ----------------------------
		// 6️⃣ Persist in repository
		// ----------------------------
		const createdUser = await this.userRepository.create(userEntity);

		// ----------------------------
		// 7️⃣ Audit logging
		// ----------------------------
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "CREATE_USER",
				targetId: createdUser.id,
				meta: { role: createdUser.role, email: createdUser.email }
			});
		}

		// ----------------------------
		// 8️⃣ Return mapped user
		// ----------------------------
		return mapUserToDTO(createdUser);
	}
}