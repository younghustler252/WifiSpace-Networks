// infrastructure/database/mongoose/repositories/user.repository.mongo.js

import UserModel from "../database/mongoose/user.model.js";
import { UserRepository } from "../../domain/user.repository.js";
import { User } from "../../domain/user.entity.js";

export class UserRepositoryMongo extends UserRepository {

	_mapToEntity(userDoc) {
		if (!userDoc) return null;

		return new User({
			id: userDoc._id,
			firstName: userDoc.firstName,
			lastName: userDoc.lastName,
			email: userDoc.email,
			hashedPassword: userDoc.password,
			role: userDoc.role,
			isVerified: userDoc.isVerified,
			permissions: userDoc.permissions,
			phone: userDoc.phone,
			nin: userDoc.nin,
			address: userDoc.address,
			dateOfBirth: userDoc.dateOfBirth,
			gender: userDoc.gender,

			status: userDoc.status,
			failedLoginAttempts: userDoc.failedLoginAttempts,
			lockUntil: userDoc.lockUntil,
			passwordChangedAt: userDoc.passwordChangedAt,
			lastLoginAt: userDoc.lastLoginAt
		});
	}

	async create(userData) {
		const created = await UserModel.create(userData);
		return this._mapToEntity(created);
	}

	async findAll(filter = {}, skip = 0, limit = 50) {
		const users = await UserModel.find(filter)
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		return users.map(u => this._mapToEntity(u));
	}

	async findById(id) {
		const user = await UserModel.findById(id);
		return this._mapToEntity(user);
	}

	async findByEmail(email) {
		const user = await UserModel.findOne({ email });
		return this._mapToEntity(user);
	}

	// 🔐 Now returns FULL entity (not raw object)
	async findAuthByEmail(email) {
		const user = await UserModel.findOne({ email }).select("+password");
		return this._mapToEntity(user);
	}

	async update(id, updateData) {
		const updated = await UserModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		return this._mapToEntity(updated);
	}

	// 🔐 SECURITY UPDATE ONLY
	async updateSecurityState(id, updateData) {
		await UserModel.findByIdAndUpdate(id, updateData);
	}

	async delete(id) {
		const deleted = await UserModel.findByIdAndDelete(id);
		return this._mapToEntity(deleted);
	}
}