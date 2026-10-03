export class AuditMapper {
	static toDomain(raw) {
		if (!raw) return null;
		return {
			id: raw._id?.toString() || raw.id,
			actorId: raw.actorId?.toString() ?? null,
			actorType: raw.actorType,
			action: raw.action,
			entity: raw.entity,
			entityId: raw.entityId?.toString() ?? null,
			oldValue: raw.oldValue,
			newValue: raw.newValue,
			metadata: raw.metadata,
			ip: raw.ip,
			userAgent: raw.userAgent,
			createdAt: raw.createdAt
		};
	}

	static toPersistence(data) {
		return {
			actorId: data.actorId ?? null,
			actorType: data.actorType,
			action: data.action,
			entity: data.entity,
			entityId: data.entityId ?? null,
			oldValue: data.oldValue ?? null,
			newValue: data.newValue ?? null,
			metadata: data.metadata ?? {},
			ip: data.ip ?? null,
			userAgent: data.userAgent ?? null
		};
	}
}