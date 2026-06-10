import { RouterEntity } from "./router.entity.js";

export class RouterMapper {
	/**
	 * Convert mongoose document -> entity
	 */
	static toEntities(docs) {
		if (!docs || !docs.length) return [];
		return docs.map((doc) => this.toEntity(doc));
	}

	static toEntity(doc) {
		if (!doc) return null;

		return new RouterEntity({
			id: doc._id?.toString(),

			name: doc.name,
			code: doc.code,

			host: doc.host,
			port: doc.port,
			routerUid: doc.routerUid,

			username: doc.username,
			password: doc.password,

			ssl: doc.ssl,

			// ✅ FIX: use schema field
			supportedServices: doc.supportedServices || [],

			location: doc.location,
			popName: doc.popName,

			status: doc.status,

			isEnabled: doc.isEnabled,
			apiEnabled: doc.apiEnabled,

			lastSeenAt: doc.lastSeenAt,
			lastProvisionSyncAt: doc.lastProvisionSyncAt,

			maxSessions: doc.maxSessions,
			currentSessions: doc.currentSessions,

			routerOsVersion: doc.routerOsVersion,
			routerBoard: doc.routerBoard,
			systemIdentity: doc.systemIdentity,

			priority: doc.priority,
			isDefaultRouter: doc.isDefaultRouter,

			lastError: doc.lastError,

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		});
	}

	/**
	 * Convert entity -> persistence object (MongoDB)
	 */
	static toPersistence(entity) {
		return {
			name: entity.name,
			code: entity.code,

			host: entity.host,
			port: entity.port,
			routerUid: entity.routerUid,

			username: entity.username,
			password: entity.password,

			ssl: entity.ssl,

			// ✅ FIX: persist array instead of routerType
			supportedServices: entity.supportedServices,

			location: entity.location,
			popName: entity.popName,

			status: entity.status,

			isEnabled: entity.isEnabled,
			apiEnabled: entity.apiEnabled,

			lastSeenAt: entity.lastSeenAt,
			lastProvisionSyncAt: entity.lastProvisionSyncAt,

			maxSessions: entity.maxSessions,
			currentSessions: entity.currentSessions,

			routerOsVersion: entity.routerOsVersion,
			routerBoard: entity.routerBoard,
			systemIdentity: entity.systemIdentity,

			priority: entity.priority,
			isDefaultRouter: entity.isDefaultRouter,

			lastError: entity.lastError,
		};
	}
}