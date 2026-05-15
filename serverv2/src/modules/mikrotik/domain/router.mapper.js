import { RouterEntity } from "../../domain/router.entity.js";

export class RouterMapper {
	/**
	 * Convert mongoose document -> entity
	 */
	static toEntity(doc) {
		if (!doc) return null;

		return new RouterEntity({
			id: doc._id?.toString(),

			name: doc.name,
			code: doc.code,

			host: doc.host,
			port: doc.port,

			username: doc.username,
			password: doc.password,

			ssl: doc.ssl,

			routerType: doc.routerType,

			location: doc.location,
			popName: doc.popName,

			status: doc.status,

			isEnabled: doc.isEnabled,

			lastSeenAt: doc.lastSeenAt,
			lastProvisionSyncAt:
				doc.lastProvisionSyncAt,

			maxSessions: doc.maxSessions,
			currentSessions:
				doc.currentSessions,

			routerOsVersion:
				doc.routerOsVersion,

			routerBoard: doc.routerBoard,

			systemIdentity:
				doc.systemIdentity,

			priority: doc.priority,

			isDefaultRouter:
				doc.isDefaultRouter,

			apiEnabled: doc.apiEnabled,

			lastError: doc.lastError,

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		});
	}

	/**
	 * Convert entity -> persistence object
	 */
	static toPersistence(entity) {
		return {
			name: entity.name,
			code: entity.code,

			host: entity.host,
			port: entity.port,

			username: entity.username,
			password: entity.password,

			ssl: entity.ssl,

			routerType: entity.routerType,

			location: entity.location,
			popName: entity.popName,

			status: entity.status,

			isEnabled: entity.isEnabled,

			lastSeenAt: entity.lastSeenAt,

			lastProvisionSyncAt:
				entity.lastProvisionSyncAt,

			maxSessions:
				entity.maxSessions,

			currentSessions:
				entity.currentSessions,

			routerOsVersion:
				entity.routerOsVersion,

			routerBoard:
				entity.routerBoard,

			systemIdentity:
				entity.systemIdentity,

			priority: entity.priority,

			isDefaultRouter:
				entity.isDefaultRouter,

			apiEnabled:
				entity.apiEnabled,

			lastError: entity.lastError,
		};
	}
}