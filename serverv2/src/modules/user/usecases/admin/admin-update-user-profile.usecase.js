import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";
import { USER_ROLE } from "../../domain/user.enum.js";

export class AdminUpdateUserProfile {
	constructor({ userRepository, auditService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, actorRole, targetId, profileData = {}, ip = null }) {
		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (target.role === USER_ROLE.SUPERADMIN && actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can modify a superadmin", USER_ERROR_CODES.CANNOT_MODIFY_SUPERADMIN);
		}

		target.updateProfile(profileData);

		const updated = await this.userRepository.update(targetId, {
			firstName: target.firstName,
			lastName: target.lastName,
			phone: target.phone,
			nin: target.nin,
			address: target.address,
			gender: target.gender,
			dateOfBirth: target.dateOfBirth,
			status: profileData.status ?? target.status
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_PROFILE_UPDATED_BY_ADMIN", resource: "User",
				metadata: { targetId, updatedFields: Object.keys(profileData), ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return updated;
	}
}