// repositories/usage-summary.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import UsageSummaryModel from "../database/usage-summary.model.js";
import { UsageSummaryMapper } from "../mappers/usage-summary.mapper.js";

export class UsageSummaryRepositoryMongo extends BaseRepository {
	constructor() { super(UsageSummaryModel, UsageSummaryMapper); }

	async findBySubscriptionId(subscriptionId) {
		return this.findOne({ filter: { subscriptionId } });
	}

	async upsertForSubscription(subscriptionId, accountId, { dataCapBytes, durationSeconds }) {
		const doc = await this.model.findOneAndUpdate(
			{ subscriptionId },
			{ $setOnInsert: { accountId, dataCapBytes, durationSeconds, totalBytesUsed: 0, totalSecondsUsed: 0 } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		return this.mapOne(doc);
	}

	async incrementUsage(subscriptionId, { bytesUsed = 0, secondsUsed = 0 }) {
		const doc = await this.model.findOneAndUpdate(
			{ subscriptionId },
			{ $inc: { totalBytesUsed: bytesUsed, totalSecondsUsed: secondsUsed }, $set: { lastSyncedAt: new Date() } },
			{ new: true }
		);
		return this.mapOne(doc);
	}
}