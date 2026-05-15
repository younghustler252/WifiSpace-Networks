import accountModel from "../database/moongoose/account.model.js";
import CounterModel from "../database/moongoose/counter.model.js";

import { AccountRepository } from "../../domain/account.repository.js";
import { AccountMapper } from "../mappers/account.mapper.js";

export class AccountRepositoryMongo extends AccountRepository {

	// ----------------------------
	// Create a new account
	// ----------------------------
	async create(accountEntity) {
        // Only auto-generate if wsnId wasn't already provided by the Use Case
        if (!accountEntity.wsnId) {
            // Check the service type to decide prefix
            const prefix = accountEntity.serviceType === 'hotspot' ? 'HS' : 'WSN';
            accountEntity.wsnId = await this.generateWsnId(prefix);
        }

        const persistenceData = AccountMapper.toPersistence(accountEntity);
        const createdModel = await accountModel.create(persistenceData);

        return AccountMapper.toDomain(createdModel);
    }
	// ----------------------------
	// Find by ID
	// ----------------------------
	async findById(id) {
		const model = await accountModel.findById(id);
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
		// console.log("RAW FROM DB:", models[0]?.userId);
		return {
			data: models.map(AccountMapper.toDomain),
			total,
			skip,
			limit,
		};
	}
	// ----------------------------
	// Find by WSN ID
	// ----------------------------
	async findByWsnId(wsnId) {
		const model = await accountModel.findOne({ wsnId });
		return AccountMapper.toDomain(model);
	}

	// ----------------------------
	// Find all accounts for a user
	// ----------------------------
	async findByUserId(userId) {
		const models = await accountModel.find({ userId });
		return models.map(AccountMapper.toDomain);
	}

	// ----------------------------
	// Update account by ID
	// ----------------------------
	async update(id, accountEntity) {
		const updateData = AccountMapper.toPersistence(accountEntity);

		const updatedModel = await accountModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		return AccountMapper.toDomain(updatedModel);
	}

	// ----------------------------
	// Delete account by ID
	// ----------------------------
	async deleteById(id) {
		const deletedModel = await accountModel.findByIdAndDelete(id);
		return AccountMapper.toDomain(deletedModel);
	}

	// ----------------------------
	// Generate unique WSN ID
	// ----------------------------
	async generateWsnId(prefix = "WSN") {
        const counter = await CounterModel.findOneAndUpdate(
            { _id: `wsnId_${prefix}` }, 
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        const nextNumber = counter.sequence_value;

        return `${prefix}${String(nextNumber).padStart(4, "0")}`;
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