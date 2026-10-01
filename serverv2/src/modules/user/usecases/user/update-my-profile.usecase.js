import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class UpdateMyProfile {
	constructor({ userRepository, auditService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ userId, profileData = {}, ip = null }) {
		const user = await this.userRepository.findById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		user.updateProfile(profileData);

		const updated = await this.userRepository.update(user.id, {
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			nin: user.nin,
			address: user.address,
			gender: user.gender,
			dateOfBirth: user.dateOfBirth,
			theme: user.theme
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id, action: "USER_PROFILE_UPDATED", resource: "User",
				metadata: { updatedFields: Object.keys(profileData), ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return updated;
	}
}