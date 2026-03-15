// modules/user/usecases/admin/verify-user.usecase.js
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { ForbiddenError } from "../../../shared/errors/forbidden-error.js";

export class VerifyUser {
	constructor(userRepository, auditService) {
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	/**
	 * Execute user verification
	 * @param {Object} params
	 * @param {string} params.userId - User ID to verify
	 * @param {Object} params.requester - Who is performing the verification
	 * @param {string} params.ip - Optional IP for audit
	 */
	async execute({ userId, requester, ip = null }) {
		const user = await this.userRepository.findById(userId);

		if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");

		if (user.isVerified) {
			throw new ForbiddenError("User is already verified", "USER_ALREADY_VERIFIED");
		}

		// Mark verified
		user.verify();

		await this.userRepository.update(user.id, { isVerified: true });

		// Audit log
		if (this.auditService) {
			await this.auditService.log({
				actorId: requester.id,
				action: "USER_VERIFIED",
				targetId: user.id,
				meta: { ip }
			});
		}

		return {
			id: user.id,
			email: user.email,
			isVerified: user.isVerified
		};
	}
}