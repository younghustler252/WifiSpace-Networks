// modules/usage/infrastructure/repositories/usage-summary.repository.mongo.js
import { UsageSummaryRepository } from "../../domain/usage-summary.repository.js";
import { UsageSummaryModel } from "../database/mongoose/usage-summary.model.js";
import { UsageSummaryMapper } from "../mappers/usage-summary.mapper.js";

export class UsageSummaryRepositoryMongo extends UsageSummaryRepository {

	/**
	 * Upsert and increment usage totals atomically.
	 * @param {UsageSummary} summary
	 * @returns {Promise<UsageSummary>}
	 */
	async upsert(summary) {
		const query = {
			accountId: summary.accountId,
			subscriptionId: summary.subscriptionId,
			periodType: summary.periodType,
			period: summary.period
		};

		// Use $inc to avoid overwriting totals in high concurrency
		const update = {
			$inc: {
				totalBytesIn: summary.totalBytesIn,
				totalBytesOut: summary.totalBytesOut,
				totalSessionTime: summary.totalSessionTime
			},
			$setOnInsert: {
				accountId: summary.accountId ?? null,
				subscriptionId: summary.subscriptionId ?? null,
				periodType: summary.periodType,
				period: summary.period
			}
		};

		const doc = await UsageSummaryModel.findOneAndUpdate(
			query,
			update,
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		return UsageSummaryMapper.toEntity(doc);
	}

	async findOne(query) {
		const doc = await UsageSummaryModel.findOne(query);
		return UsageSummaryMapper.toEntity(doc);
	}

	async find(filters = {}) {
		const docs = await UsageSummaryModel.find(filters);
		return docs.map(UsageSummaryMapper.toEntity);
	}
}