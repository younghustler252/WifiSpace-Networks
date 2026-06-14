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
		const user = await UserModel.findById(id).select("+password +verificationOTP +otpExpiresAt +otpAttempts");
		return UserMapper.toDomain(user);
	}

	async findByEmail(email) {
		const user = await UserModel.findOne({ email });
		return UserMapper.toDomain(user);
	}

	async findAuthByEmail(email) {
		const user = await UserModel.findOne({ email }).select("+password +verificationOTP +otpExpiresAt +otpAttempts")
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

	async count(filter = {}) {
		return UserModel.countDocuments(filter);
	}

	async getDashboardStats() {
		const [stats] = await UserModel.aggregate([
			{
				$group: {
					_id: null,

					total: { $sum: 1 },

					customers: {
						$sum: {
							$cond: [
								{ $eq: ["$role", "customer"] },
								1,
								0
							]
						}
					},

					staff: {
						$sum: {
							$cond: [
								{ $eq: ["$role", "staff"] },
								1,
								0
							]
						}
					},

					superadmins: {
						$sum: {
							$cond: [
								{ $eq: ["$role", "superadmin"] },
								1,
								0
							]
						}
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

					suspended: {
						$sum: {
							$cond: [
								{ $eq: ["$status", "suspended"] },
								1,
								0
							]
						}
					},

					banned: {
						$sum: {
							$cond: [
								{ $eq: ["$status", "banned"] },
								1,
								0
							]
						}
					}
				}
			}
		]);

		return stats;
	}
}