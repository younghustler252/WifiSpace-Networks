import { Router } from "../domain/router.entity.js";

const FIELDS = [
	"name", "code", "host", "port", "username", "ssl", "routerUid",
	"supportedServices", "location", "siteCode", "popName", "status", "lastError",
	"isEnabled", "apiEnabled", "lastSeenAt", "lastProvisionSyncAt",
	"connectionType", "connectorId", "maxSessions", "currentSessions",
	"agentLastSeenAt", "agentStatus", "routerOsVersion", "routerBoard", "systemIdentity",
	"priority", "isDefaultRouter", "deletedAt"
];

export class RouterMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, password: raw.password ?? null, createdAt: raw.createdAt, updatedAt: raw.updatedAt };
		for (const f of FIELDS) data[f] = raw[f];
		return new Router(data);
	}

	static toPersistence(router) {
		const data = { password: router.password }; // repository intercepts + encrypts this before it ever reaches Mongo
		for (const f of FIELDS) data[f] = router[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}