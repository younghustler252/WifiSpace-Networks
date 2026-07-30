import { ValidationError } from "../../../shared/errors/validation-error.js";

export class RefreshHotspotSession {
	constructor({
		hotspotSessionRepository
	}) {
		this.hotspotSessionRepository =
			hotspotSessionRepository;
	}

	async execute(sessionId) {
		if (!sessionId) {
			throw new ValidationError(
				"sessionId is required"
			);
		}

		const session =
			await this.hotspotSessionRepository.findById(sessionId);

		if (!session) {
			return null;
		}

		session.lastSeenAt = new Date();

		return this.hotspotSessionRepository.update(
			session.id,
			session
		);
	}
}