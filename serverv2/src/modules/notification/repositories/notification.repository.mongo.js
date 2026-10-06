// repositories/notification.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import NotificationModel from "../database/notification.model.js";
import { NotificationMapper } from "../mappers/notification.mapper.js";
// repositories/notification.repository.mongo.js
const ADMIN_POPULATE = { path: "createdByAdminId", select: "firstName lastName email" };

export class NotificationRepositoryMongo extends BaseRepository {
	constructor() { super(NotificationModel, NotificationMapper); }
	async findById(id) { return super.findById(id, { populates: [ADMIN_POPULATE] }); }
	async paginate(opts = {}) { return super.paginate({ ...opts, populates: [ADMIN_POPULATE] }); }
	async update(id, entityOrData) { await this.model.findByIdAndUpdate(id, NotificationMapper.toPersistence(entityOrData), { new: true }); return this.findById(id); }
}