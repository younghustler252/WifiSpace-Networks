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

    async findByWsnId(wsnId) {
        const model = await accountModel.findOne({ wsnId });
        return AccountMapper.toDomain(model);
    }

    async findByUserId(userId) {
        const models = await accountModel.find({ userId });
        return models.map(AccountMapper.toDomain);
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

    async countActiveAccounts() {
        return accountModel.countDocuments({ profileStatus: "active" });
    }

    async countSuspendedAccounts() {
        return accountModel.countDocuments({ profileStatus: "suspended" });
    }
}