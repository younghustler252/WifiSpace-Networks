import { UsageRepository } from "../../domain/usage.repository.js";
import UsageSnapshotModel from "../database/mongoose/usage.model.js";
import { UsageMapper } from "../mappers/usage.mapper.js";

export class MongoUsageRepository extends UsageRepository {

    async findByAccountId(accountId) {
        const doc = await UsageSnapshotModel.findOne({ accountId });
        return UsageMapper.toDomain(doc);
    }

    async findByWsnId(wsnId) {
        const doc = await UsageSnapshotModel.findOne({ wsnId });
        return UsageMapper.toDomain(doc);
    }

    async upsert(snapshot) {
        const data = UsageMapper.toPersistence(snapshot);

        const doc = await UsageSnapshotModel.findOneAndUpdate(
            { accountId: snapshot.accountId },
            {
                $set: {
                    ...data,
                    lastSeenAt: new Date()
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        return UsageMapper.toDomain(doc);
    }

    async markOffline(accountId) {
        const doc = await UsageSnapshotModel.findOneAndUpdate(
            { accountId },
            {
                $set: {
                    online: false,
                    lastSeenAt: new Date()
                }
            },
            { new: true }
        );

        return UsageMapper.toDomain(doc);
    }

    async bulkUpsert(snapshots = []) {
        if (!snapshots.length) return;

        const ops = snapshots.map(snapshot => {
            const data = UsageMapper.toPersistence(snapshot);

            return {
                updateOne: {
                    filter: { accountId: snapshot.accountId },
                    update: {
                        $set: {
                            ...data,
                            lastSeenAt: new Date()
                        }
                    },
                    upsert: true
                }
            };
        });

        return UsageSnapshotModel.bulkWrite(ops);
    }

    async findAll(filters = {}, { skip = 0, limit = 20 } = {}) {
        const query = {};

        if (filters.routerId) query.routerId = filters.routerId;
        if (filters.online !== undefined) query.online = filters.online;
        if (filters.wsnId) query.wsnId = filters.wsnId;
        if (filters.accountId) query.accountId = filters.accountId;

        const docs = await UsageSnapshotModel.find(query)
            .sort({ lastSeenAt: -1 })
            .skip(skip)
            .limit(limit);

        return docs.map(doc => UsageMapper.toDomain(doc));
    }

    async count(filters = {}) {
    const query = {};

    if (filters.routerId) query.routerId = filters.routerId;
    if (filters.online !== undefined) query.online = filters.online;
    if (filters.wsnId) query.wsnId = filters.wsnId;
    if (filters.accountId) query.accountId = filters.accountId;

    return UsageSnapshotModel.countDocuments(query);
}
}