import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

export class RevokeHotspotSession {
	constructor({ hotspotSessionRepository, networkService, subscriptionRepository, auditService }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.networkService = networkService;
		this.subscriptionRepository = subscriptionRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, macAddress, ip = null }) {
		const session = await this.hotspotSessionRepository.findByMac(macAddress);
		if (!session) throw new NotFoundError("Session not found", HOTSPOT_ERROR_CODES.SESSION_NOT_FOUND);

		session.revoke();
		const updated = await this.hotspotSessionRepository.update(session.id, session);

		if (session.accountId) {
			const subscription = await this.subscriptionRepository.findCurrentByAccountId(session.accountId);
			if (subscription) {
				await this.networkService.disconnect(subscription).catch((err) =>
					console.error("[RevokeHotspotSession] Network disconnect failed:", err.message)
				);
			}
		}

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "HOTSPOT_SESSION_REVOKED", entity: "HotspotSession", entityId: session.id, ip });
		}

		return updated;
	}
}