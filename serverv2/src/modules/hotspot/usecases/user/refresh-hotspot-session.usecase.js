import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class RefreshHotspotSession {
	constructor({ hotspotSessionRepository }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ macAddress }) {
		const session = await this.hotspotSessionRepository.findByMac(macAddress);
		if (!session) throw new NotFoundError("Session not found", HOTSPOT_ERROR_CODES.SESSION_NOT_FOUND);

		session.refresh(new Date(Date.now() + SESSION_TTL_MS));
		return this.hotspotSessionRepository.update(session.id, session);
	}
}