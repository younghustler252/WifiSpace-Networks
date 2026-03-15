// modules/usage/infrastructure/mappers/usage.mapper.js
import { Usage } from "../../domain/usage.entity.js";

export const UsageMapper = {
	toEntity(doc) {
		if (!doc) return null;
		return new Usage({
			id: doc._id.toString(),
			accountId: doc.accountId,
			subscriptionId: doc.subscriptionId,
			sessionId: doc.sessionId,
			type: doc.type,
			ipAddress: doc.ipAddress,
			macAddress: doc.macAddress,
			bytesIn: Number(doc.bytesIn), // Decimal128 -> Number
			bytesOut: Number(doc.bytesOut),
			sessionTime: doc.sessionTime,
			startedAt: doc.startedAt,
			endedAt: doc.endedAt
		});
	},

	toPersistence(entity) {
		return {
			accountId: entity.accountId,
			subscriptionId: entity.subscriptionId,
			sessionId: entity.sessionId,
			type: entity.type,
			ipAddress: entity.ipAddress,
			macAddress: entity.macAddress,
			bytesIn: entity.bytesIn,
			bytesOut: entity.bytesOut,
			sessionTime: entity.sessionTime,
			startedAt: entity.startedAt,
			endedAt: entity.endedAt,
			status: entity.getStatus()
		};
	}
};