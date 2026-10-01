// repositories/notification.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import NotificationModel from "../database/notification.model.js";
import { NotificationMapper } from "../mappers/notification.mapper.js";

export class NotificationRepositoryMongo extends BaseRepository {
	constructor() { super(NotificationModel, NotificationMapper); }

	async update(id, entityOrData) {
		await this.model.findByIdAndUpdate(id, NotificationMapper.toPersistence(entityOrData), { new: true });
		return this.findById(id);
	}
}