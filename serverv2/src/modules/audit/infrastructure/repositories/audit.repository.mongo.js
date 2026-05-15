// src/infrastructure/database/mongoose/repositories/audit.repository.mongo.js
import AuditModel from "../database/moongoose/audit.model.js";
import { AuditRepository } from "../../domain/audit.repository.js";

export class AuditRepositoryMongo extends AuditRepository {
	async create(logData) {
		const created = await AuditModel.create(logData);
		return created.toObject();
	}

	async find(filter = {}, skip = 0, limit = 50) {
		const logs = await AuditModel.find(filter)
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		return logs.map(log => log.toObject());
	}
}