import SubscriptionModel from "../database/mongoose/subscription.model.js";
import { SubscriptionRepository } from "../../domain/subscripton.repository.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";

export class SubscriptionRepositoryMongo extends SubscriptionRepository {

    async create(subscription) {
        const data = SubscriptionMapper.toPersistence(subscription);
        const doc = await SubscriptionModel.create(data);
        return SubscriptionMapper.toDomain(doc);
    }

    async save(subscription) {
        const data = SubscriptionMapper.toPersistence(subscription);
        const doc = await SubscriptionModel.findByIdAndUpdate(
            subscription.id,
            data,
            { returnDocument: 'after' }
        );
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findById(id) {
        const doc = await SubscriptionModel.findById(id)
            .populate("planId")
            .populate("accountId");
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findByAccountId(accountId) {
        const docs = await SubscriptionModel.find({ accountId })
            .populate("planId");
        return docs.map(SubscriptionMapper.toDomain);
    }

    async findActiveByAccount(accountId) {
        const doc = await SubscriptionModel.findOne({
            accountId,
            status: "active",
            expiresAt: { $gt: new Date() }
        }).populate("planId");
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findSuspendedByAccount(accountId) {
        const doc = await SubscriptionModel.findOne({
            accountId,
            status: "suspended"
        }).populate("planId");
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findLatestByAccount(accountId) {
        const doc = await SubscriptionModel.findOne({ accountId })
            .sort({ createdAt: -1 })
            .populate("planId");
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findExpired(now) {
        const docs = await SubscriptionModel.find({
            status: "active",
            expiresAt: { $lte: now }
        });
        return docs.map(SubscriptionMapper.toDomain);
    }

    async update(id, subscription) {
        const data = SubscriptionMapper.toPersistence(subscription);

        const doc = await SubscriptionModel.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );

        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }
    async updateStatus(id, status) {
        const doc = await SubscriptionModel.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        );
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async findMany({ filter = {}, limit = 20, skip = 0, sort = { createdAt: -1 } } = {}) {
        const docs = await SubscriptionModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("planId")
            .populate("accountId")
            .populate("userId", "email firstName lastName")
        return docs.map(SubscriptionMapper.toDomain);
    }

    async count(filter = {}) {
        return SubscriptionModel.countDocuments(filter);
    }

    async countAllSubscriptions() {
        return SubscriptionModel.countDocuments();
    }

    async countActiveSubscriptions() {
        return SubscriptionModel.countDocuments({
            status: "active",
            expiresAt: { $gt: new Date() }
        });
    }

    async findInGracePeriod() {
        const now = new Date();
        const docs = await SubscriptionModel.find({
            expiresAt: { $lt: now },
            status: "active",
            "planSnapshot.gracePeriodDays": { $gt: 0 }
        });
        return docs.map(SubscriptionMapper.toDomain).filter(sub => sub.isInGracePeriod());
    }

    async findActiveIncludingGrace() {
        const docs = await SubscriptionModel.find({
            status: { $in: ["active", "suspended"] }
        });
        return docs.map(SubscriptionMapper.toDomain).filter(sub => sub.hasAccess());
    }
    async findExpiringBetween(start, end) {
        const docs = await SubscriptionModel.find({
            status: "active",
            expiresAt: {
                $gte: start,
                $lte: end
            }
        })
        .populate("userId", "email firstName");

        return docs.map(SubscriptionMapper.toDomain);
    }
    async getDashboardStats() {
        const [stats] = await SubscriptionModel.aggregate([
            {
                $group: {
                    _id: null,

                    total: {
                        $sum: 1
                    },

                    active: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "active"] },
                                1,
                                0
                            ]
                        }
                    },

                    pending: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "pending"] },
                                1,
                                0
                            ]
                        }
                    },

                    suspended: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "suspended"] },
                                1,
                                0
                            ]
                        }
                    },

                    expired: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "expired"] },
                                1,
                                0
                            ]
                        }
                    },

                    canceled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "canceled"] },
                                1,
                                0
                            ]
                        }
                    },

                    autoRenewEnabled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$autoRenewEnabled", true] },
                                1,
                                0
                            ]
                        }
                    },

                    mikrotikSynced: {
                        $sum: {
                            $cond: [
                                { $eq: ["$mikrotikStatus", "synced"] },
                                1,
                                0
                            ]
                        }
                    },

                    mikrotikFailed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$mikrotikStatus", "failed"] },
                                1,
                                0
                            ]
                        }
                    },

                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        return (
            stats || {
                total: 0,
                active: 0,
                pending: 0,
                suspended: 0,
                expired: 0,
                canceled: 0,
                autoRenewEnabled: 0,
                mikrotikSynced: 0,
                mikrotikFailed: 0,
                totalRevenue: 0
            }
        );
    }
}