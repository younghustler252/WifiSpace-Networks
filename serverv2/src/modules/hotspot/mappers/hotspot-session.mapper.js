import { HotspotSession } from "../domain/hotspot-session.entity.js";

export class HotspotSessionMapper {
	static toDomain(doc) {
		if (!doc) return null;

		const data = doc.toObject ? doc.toObject() : doc;

		return new HotspotSession({
			id: data._id?.toString() || data.id,
			userId: data.userId,
			accountId: data.accountId,
			routerId: data.routerId,
			macAddress: data.macAddress,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			status: data.status,
			trustedDevice: data.trustedDevice,
			lastSeenAt: data.lastSeenAt,
			expiresAt: data.expiresAt,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		});
	}

	static toPersistence(entity) {
		if (!entity) return null;

		return {
			userId: entity.userId,
			accountId: entity.accountId,
			routerId: entity.routerId,
			macAddress: entity.macAddress,
			ipAddress: entity.ipAddress,
			userAgent: entity.userAgent,
			status: entity.status,
			trustedDevice: entity.trustedDevice,
			lastSeenAt: entity.lastSeenAt,
			expiresAt: entity.expiresAt
		};
	}
}