import { User } from "../../user/domain/user.entity.js";

export class RegisterHotspotUser {
	constructor({ userRepository, passwordService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ firstName, email, phone }) {
		// 1. Check existing user
		let user = await this.userRepository.findByEmail(email);

		if (!user) {
			// 2. hash phone (temporary password)
			const hashedPassword = await this.passwordService.hash(phone);

			// 3. CREATE ENTITY (same as RegisterUser)
			const userEntity = new User({
				firstName,
				lastName: "Guest",
				email,
				hashedPassword, // ✅ IMPORTANT: match entity, NOT DB
				role: "customer",
				status: "active",
				isVerified: true,
				phone,
				permissions: []
			});

			// 4. persist via repository (mapper handles DB conversion)
			user = await this.userRepository.create(userEntity);

			// 5. audit
			await this.auditService.log({
				actorId: user.id,
				action: "HOTSPOT_AUTO_REGISTER",
				resource: "User",
				metadata: {
					email,
					phone,
					method: "Paystack_Silent"
				}
			});
		} else {
			if (!user.phone && phone) {
				await this.userRepository.update(user.id, { phone });
			}
		}

		return user;
	}
}