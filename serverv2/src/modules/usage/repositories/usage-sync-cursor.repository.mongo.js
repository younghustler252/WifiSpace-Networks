import UsageSyncCursorModel from "../database/usage-sync-cursor.model.js";

export class UsageSyncCursorRepositoryMongo {
	async find({ routerId, username }) {
		return UsageSyncCursorModel.findOne({ routerId, username }).lean();
	}

	async upsert({ subscriptionId, accountId, routerId, username, lastBytes, lastSeconds }) {
		return UsageSyncCursorModel.findOneAndUpdate(
			{ routerId, username },
			{ $set: { subscriptionId, accountId, lastBytes, lastSeconds, lastSyncedAt: new Date() } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).lean();
	}
}