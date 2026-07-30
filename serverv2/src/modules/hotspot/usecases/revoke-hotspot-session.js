import { ValidationError } from "../../../shared/errors/validation-error.js";

export class RevokeHotspotSession {
	constructor({
		hotspotSessionRepository
	}) {
		this.hotspotSessionRepository =
			hotspotSessionRepository;
	}

	async execute({
		sessionId,
		accountId
	}) {
		if (sessionId) {
			const session =
				await this.hotspotSessionRepository.findById(
					sessionId
				);

			if (!session) {
				return null;
			}

			session.status = "revoked";

			return this.hotspotSessionRepository.update(
				session.id,
				session
			);
		}

		if (accountId) {
			await this.hotspotSessionRepository.revokeByAccount(
				accountId
			);

			return true;
		}

		throw new ValidationError(
			"sessionId or accountId is required"
		);
	}
}