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

    async findExpiredCandidates(now) {
        const docs = await SubscriptionModel.find({
            status: "active",
            expiresAt: { $lte: now }
        });
        return docs.map(SubscriptionMapper.toDomain);
    }

    async update(id, updateData) {
        const doc = await SubscriptionModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
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
            .populate("accountId");
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
}