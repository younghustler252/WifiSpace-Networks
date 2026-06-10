// modules/usage/infrastructure/repositories/usage.repository.mongo.js
import { UsageRepository } from "../../domain/usage.repository.js";
import { UsageModel } from "../database/mongoose/usage.model.js";
import { UsageMapper } from "../mappers/usage.mapper.js";

export class UsageRepositoryMongo extends UsageRepository {

	/**
	 * Save or upsert a usage record atomically.
	 * @param {Usage} usage
	 * @returns {Promise<Usage>}
	 */
	async save(usage) {
		const query = { sessionId: usage.sessionId };

		// Atomic update to prevent race conditions
		const update = {
			$set: {
				accountId: usage.accountId,
				subscriptionId: usage.subscriptionId,
				ipAddress: usage.ipAddress,
				macAddress: usage.macAddress,
				startedAt: usage.startedAt,
				endedAt: usage.endedAt
			},
			$inc: {
				bytesIn: usage.bytesIn,
				bytesOut: usage.bytesOut,
				sessionTime: usage.sessionTime
			}
		};

		const doc = await UsageModel.findOneAndUpdate(
			query,
			update,
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		return UsageMapper.toEntity(doc);
	}

	/**
	 * Mark a session as ended.
	 */
	async markSessionEnded(sessionId, endedAt = new Date()) {
		const doc = await UsageModel.findOneAndUpdate(
			{ sessionId },
			{ $set: { endedAt } },
			{ new: true }
		);
		return UsageMapper.toEntity(doc);
	}

	async findBySessionId(sessionId) {
		const doc = await UsageModel.findOne({ sessionId });
		return UsageMapper.toEntity(doc);
	}

	async findByAccountId(accountId, filters = {}) {
		const query = { accountId };

		if (filters.status === "active") query.endedAt = null;
		if (filters.status === "ended") query.endedAt = { $ne: null };
		if (filters.start) query.startedAt = { $gte: filters.start };
		if (filters.end) query.endedAt = { $lte: filters.end };

		const docs = await UsageModel.find(query).sort({ startedAt: -1 });
		return docs.map(UsageMapper.toEntity);
	}

	async deleteBySessionId(sessionId) {
		await UsageModel.deleteOne({ sessionId });
	}

	/**
	 * Optional batch save for multiple usage updates
	 * @param {Usage[]} usages
	 * @returns {Promise<Usage[]>}
	 */
	async batchSave(usages) {
		const operations = usages.map(usage => {
			const query = { sessionId: usage.sessionId };
			const update = {
				$set: {
					accountId: usage.accountId,
					subscriptionId: usage.subscriptionId,
					ipAddress: usage.ipAddress,
					macAddress: usage.macAddress,
					startedAt: usage.startedAt,
					endedAt: usage.endedAt
				},
				$inc: {
					bytesIn: usage.bytesIn,
					bytesOut: usage.bytesOut,
					sessionTime: usage.sessionTime
				}
			};
			return {
				updateOne: {
					filter: query,
					update,
					upsert: true
				}
			};
		});

		const result = await UsageModel.bulkWrite(operations, { ordered: false });
		// Fetch updated docs
		const sessionIds = usages.map(u => u.sessionId);
		const docs = await UsageModel.find({ sessionId: { $in: sessionIds } });
		return docs.map(UsageMapper.toEntity);
	}
}