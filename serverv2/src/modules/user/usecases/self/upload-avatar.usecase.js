// modules/user/usecases/self/upload-avatar.usecase.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";

export class UploadAvatar {
	constructor(userRepository, fileStorageService, auditService) {
		this.userRepository = userRepository;
		this.fileStorageService = fileStorageService;
		this.auditService = auditService;
	}

	async execute({ userId, file, ip = null }) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
		}

		// 1️⃣ Upload file
		const uploaded = await this.fileStorageService.upload(file);

		// uploaded = { url, publicId }

		// 2️⃣ Update entity
		user.updateAvatar({
			url: uploaded.url,
			publicId: uploaded.publicId
		});

		// 3️⃣ Persist
		await this.userRepository.update(user.id, user);

		// 4️⃣ Audit
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "UPLOAD_AVATAR",
				meta: { ip }
			});
		}

		// 5️⃣ Return entity
		return user;
	}
}