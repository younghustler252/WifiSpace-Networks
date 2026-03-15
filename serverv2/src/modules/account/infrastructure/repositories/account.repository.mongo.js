import accountModel from "../database/moongoose/account.model.js";
import CounterModel from "../database/moongoose/counter.model.js";

import { AccountRepository } from "../../domain/account.repository.js";
import AccountMapper from "../mappers/account.mapper.js";

export class AccountRepositoryMongo extends AccountRepository {

	// ----------------------------
	// Create a new account
	// ----------------------------
	async create(accountEntity) {
		// Ensure WSN ID
		if (!accountEntity.wsnId) {
			accountEntity.wsnId = await this.generateWsnId();
		}

		// Map domain → persistence
		const persistenceData = AccountMapper.toPersistence(accountEntity);

		const createdModel = await accountModel.create(persistenceData);

		// Return domain entity
		return AccountMapper.toDomain(createdModel);
	}

	// ----------------------------
	// Find by ID
	// ----------------------------
	async findById(id) {
		const model = await accountModel.findById(id);
		return AccountMapper.toDomain(model);
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
	async generateWsnId() {
		// Atomic counter in Mongo
		const counter = await CounterModel.findOneAndUpdate(
			{ _id: "wsnId" },
			{ $inc: { sequence_value: 1 } },
			{ new: true, upsert: true }
		);

		const nextNumber = counter.sequence_value;

		// Format: WSN000001
		return `WSN${String(nextNumber).padStart(6, "0")}`;
	}
}