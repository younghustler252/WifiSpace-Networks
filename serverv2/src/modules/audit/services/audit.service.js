import { ACTOR_TYPES } from "../domain/audit.enum.js";

export class AuditService {
	constructor({ auditRepository }) {
		this.auditRepository = auditRepository;
	}

	async log({
		actorId = null,
		actorType,
		action,
		entity,
		entityId = null,
		oldValue = null,
		newValue = null,
		metadata = {},
		ip = null,
		userAgent = null
	}) {
		try {
			return await this.auditRepository.create({
				actorId,
				actorType: actorType ?? (actorId ? ACTOR_TYPES.USER : ACTOR_TYPES.SYSTEM),
				action,
				entity,
				entityId,
				oldValue,
				newValue,
				metadata,
				ip,
				userAgent
			});
		} catch (err) {
			console.error("[AuditService] Failed to write audit log:", err.message);
			return null;
		}
	}
}