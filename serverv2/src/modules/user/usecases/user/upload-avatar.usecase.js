import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class UploadAvatar {
	constructor({ userRepository, fileStorageService, auditService }) {
		this.userRepository = userRepository;
		this.fileStorageService = fileStorageService;
		this.auditService = auditService;
	}

	async execute({ userId, file, ip = null }) {
		if (!file) {
			throw new ValidationError("No file provided");
		}

		const user = await this.userRepository.findById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		const previousPublicId = user.avatar?.publicId;

		const uploaded = await this.fileStorageService.upload(file);
		user.updateAvatar({ url: uploaded.url, publicId: uploaded.publicId });

		const updated = await this.userRepository.update(user.id, {
			avatar: user.avatar
		});

		if (previousPublicId) {
			this.fileStorageService
				.delete(previousPublicId)
				.catch((err) => console.error("[UploadAvatar] Failed to delete old avatar:", err.message));
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id, action: "USER_AVATAR_UPDATED", resource: "User", metadata: { ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return updated;
	}
}