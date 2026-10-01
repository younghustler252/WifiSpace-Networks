// unban-user.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class UnbanUser {
	constructor({ userRepository, auditService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, targetId, ip = null }) {
		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		target.activate();
		const updated = await this.userRepository.update(targetId, { status: target.status });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "USER_UNBANNED", resource: "User", metadata: { targetId, ip }
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return updated;
	}
}