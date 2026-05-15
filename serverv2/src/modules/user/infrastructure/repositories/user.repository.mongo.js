import UserModel from "../database/mongoose/user.model.js";
import { UserRepository } from "../../domain/user.repository.js";
import { UserMapper } from "../../domain/user-mapper.js";

export class UserRepositoryMongo extends UserRepository {

	async create(userData) {
		const created = await UserModel.create(UserMapper.toPersistence(userData));
		return UserMapper.toDomain(created);
	}

	async findAll(filter = {}, sort = {}, skip = 0, limit = 50) {
		const [users, total] = await Promise.all([
			UserModel.find(filter)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean(), // 🔥 performance boost

			UserModel.countDocuments(filter)
		]);

		return {
			data: users.map(u => UserMapper.toDomain(u)),
			total,
			skip,
			limit
		};
	}

	async findById(id) {
		const user = await UserModel.findById(id);
		return UserMapper.toDomain(user);
	}
	
	async findAuthById(id) {
		const user = await UserModel.findById(id).select("+password");
		return UserMapper.toDomain(user);
	}

	async findByEmail(email) {
		const user = await UserModel.findOne({ email });
		return UserMapper.toDomain(user);
	}

	async findAuthByEmail(email) {
		const user = await UserModel.findOne({ email }).select("+password");
		return UserMapper.toDomain(user);
	}

	async update(id, updateData) {
		const updated = await UserModel.findByIdAndUpdate(
			id,
			UserMapper.toPersistence(updateData),
			{ returnDocument: "after" }
		);
		return UserMapper.toDomain(updated);
	}

	async updateSecurityState(id, updateData) {
		await UserModel.findByIdAndUpdate(
			id,
			UserMapper.toPersistence(updateData),
			{ returnDocument: "after" }
		);
	}

	async delete(id) {
		const deleted = await UserModel.findByIdAndDelete(id);
		return UserMapper.toDomain(deleted);
	}

	async countAllUsers() {
        return UserModel.countDocuments();  // Mongoose `countDocuments` to count all users
    }

    async countActiveUsers() {
        return UserModel.countDocuments({ status: "active" });
    }
}