import accountModel from "../database/moongoose/account.model.js";
import CounterModel from "../database/moongoose/counter.model.js";

import { AccountRepository } from "../../domain/account.repository.js";
import { AccountMapper } from "../mappers/account.mapper.js";

export class AccountRepositoryMongo extends AccountRepository {

    async create(accountEntity) {
        if (!accountEntity.wsnId) {
            const prefix = accountEntity.serviceType === 'hotspot' ? 'HS' : 'WSN';
            accountEntity.wsnId = await this.generateWsnId(prefix);
        }

        const persistenceData = AccountMapper.toPersistence(accountEntity);
        const createdModel = await accountModel.create(persistenceData);
        return AccountMapper.toDomain(createdModel);
    }

    async findById(id) {
        const model = await accountModel.findById(id)
            .populate("userId", "firstName lastName email avatar");
        return AccountMapper.toDomain(model);
    }

    async findAll(query = {}, sort = {}, skip = 0, limit = 50) {
        const [models, total] = await Promise.all([
            accountModel
                .find(query)
                .populate("userId", "firstName lastName email avatar")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            accountModel.countDocuments(query),
        ]);
        return {
            data: models.map(AccountMapper.toDomain),
            total,
            skip,
            limit,
        };
    }
    async findOne(filters) {
        const doc = await accountModel.findOne({  // ← lowercase, matches your import
            ...filters
          
        }).lean();

        return doc ? AccountMapper.toDomain(doc) : null;  // ← use AccountMapper
    }

    async findByWsnId(wsnId) {
        const model = await accountModel.findOne({ wsnId });
        return AccountMapper.toDomain(model);
    }

    async findByUserId(userId) {
        const models = await accountModel.find({ userId });
        return models.map(AccountMapper.toDomain);
    }
    // In your AccountRepository implementation

    async findByMac(macAddress) {
        const normalized = macAddress.toUpperCase().trim();

        const doc = await accountModel.findOne({
            "devices.macAddress": normalized,
            serviceType: "hotspot"
        }).lean();

        return doc ? AccountMapper.toDomain(doc) : null;
    }

    async update(id, accountEntity) {
        const updateData = AccountMapper.toPersistence(accountEntity);
        const updatedModel = await accountModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' } // ✅ use new Mongoose option
        );
        return AccountMapper.toDomain(updatedModel);
    }

    async deleteById(id) {
        const deletedModel = await accountModel.findByIdAndDelete(id);
        return AccountMapper.toDomain(deletedModel);
    }

    async generateWsnId(prefix = "WSN") {
        const counter = await CounterModel.findOneAndUpdate(
            { _id: `wsnId_${prefix}` },
            { $inc: { sequence_value: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        return `${prefix}${String(counter.sequence_value).padStart(4, "0")}`;
    }

    async countAllAccounts() {
        return accountModel.countDocuments();
    }
    async count(filter = {}) {
        return accountModel.countDocuments(filter);
    }
    async getDashboardStats() {
        const [stats] = await accountModel.aggregate([
            {
                $group: {
                    _id: null,

                    total: {
                        $sum: 1
                    },

                    active: {
                        $sum: {
                            $cond: [
                                { $eq: ["$profileStatus", "active"] },
                                1,
                                0
                            ]
                        }
                    },

                    pending: {
                        $sum: {
                            $cond: [
                                { $eq: ["$profileStatus", "pending"] },
                                1,
                                0
                            ]
                        }
                    },

                    suspended: {
                        $sum: {
                            $cond: [
                                { $eq: ["$profileStatus", "suspended"] },
                                1,
                                0
                            ]
                        }
                    },

                    canceled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$profileStatus", "canceled"] },
                                1,
                                0
                            ]
                        }
                    },

                    pppoe: {
                        $sum: {
                            $cond: [
                                { $eq: ["$serviceType", "pppoe"] },
                                1,
                                0
                            ]
                        }
                    },

                    hotspot: {
                        $sum: {
                            $cond: [
                                { $eq: ["$serviceType", "hotspot"] },
                                1,
                                0
                            ]
                        }
                    },

                    personal: {
                        $sum: {
                            $cond: [
                                { $eq: ["$accountType", "personal"] },
                                1,
                                0
                            ]
                        }
                    },

                    business: {
                        $sum: {
                            $cond: [
                                { $eq: ["$accountType", "business"] },
                                1,
                                0
                            ]
                        }
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
                canceled: 0,
                pppoe: 0,
                hotspot: 0,
                personal: 0,
                business: 0
            }
        );
    }
}