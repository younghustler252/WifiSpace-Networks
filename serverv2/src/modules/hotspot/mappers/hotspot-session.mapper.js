import { HotspotSession } from "../domain/hotspot-session.entity.js";

const FIELDS = ["userId", "accountId", "routerId", "macAddress", "ipAddress", "userAgent", "status", "trustedDevice", "lastSeenAt", "expiresAt"];

export class HotspotSessionMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt };
		for (const f of FIELDS) data[f] = raw[f];
		data.userId = raw.userId?._id?.toString() || raw.userId?.toString() || null;
		data.accountId = raw.accountId?._id?.toString() || raw.accountId?.toString() || null;
		data.routerId = raw.routerId?._id?.toString() || raw.routerId?.toString() || null;
		data.router = raw.routerId && typeof raw.routerId === "object" ? raw.routerId : null;
		return new HotspotSession(data);
	}

	static toPersistence(session) {
		const data = {};
		for (const f of FIELDS) data[f] = session[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}
