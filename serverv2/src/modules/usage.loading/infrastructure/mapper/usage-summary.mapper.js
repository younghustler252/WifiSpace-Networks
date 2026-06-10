// modules/usage/infrastructure/mappers/usage-summary.mapper.js
import { UsageSummary } from "../../domain/usage-summary.entity.js";

export const UsageSummaryMapper = {
	// Converts a Mongoose doc to domain entity
	toEntity(doc) {
		if (!doc) return null;

		return new UsageSummary({
			id: doc._id.toString(),
			accountId: doc.accountId ?? null,
			subscriptionId: doc.subscriptionId ?? null,
			periodType: doc.periodType,
			period: doc.period,
			totalBytesIn: doc.totalBytesIn,
			totalBytesOut: doc.totalBytesOut,
			totalSessionTime: doc.totalSessionTime
		});
	},

	// Converts domain entity to persistence format for MongoDB
	toPersistence(entity) {
		return {
			accountId: entity.accountId,
			subscriptionId: entity.subscriptionId,
			periodType: entity.periodType,
			period: entity.period,
			totalBytesIn: entity.totalBytesIn,
			totalBytesOut: entity.totalBytesOut,
			totalSessionTime: entity.totalSessionTime
		};
	}
};