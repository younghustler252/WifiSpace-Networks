// repositories/notification-recipient.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import NotificationRecipientModel from "../database/notification-recipient.model.js";
import { NotificationRecipientMapper } from "../mappers/notification-recipient.mapper.js";


const USER_POPULATE = { path: "userId", select: "firstName lastName email phone" };

export class NotificationRecipientRepositoryMongo extends BaseRepository {
	constructor() { super(NotificationRecipientModel, NotificationRecipientMapper); }

	async findByNotificationId(notificationId) {
		const docs = await this.model.find({ notificationId }).populate(USER_POPULATE).lean();
		return this.mapArray(docs);
	}

	async paginate(opts = {}) {
		return super.paginate({ ...opts, populates: [USER_POPULATE] });
	}

	async findByUser(userId, { status, page = 1, limit = 20 } = {}) {
		const filter = { userId };
		if (status) filter.status = status;
		return this.paginate({ filter, sort: { createdAt: -1 }, page, limit });
	}

	async findDueForRetry() {
		const docs = await this.model.find({ status: "FAILED", nextRetryAt: { $lte: new Date() } }).lean();
		return this.mapArray(docs);
	}

	async findPendingByPriority() {
		const docs = await this.model.find({ status: { $in: ["PENDING", "QUEUED"] } }).sort({ priority: -1, createdAt: 1 }).limit(200).lean();
		return this.mapArray(docs);
	}

	async update(id, entityOrData) {
		await this.model.findByIdAndUpdate(id, NotificationRecipientMapper.toPersistence(entityOrData), { new: true });
		return this.findById(id);
	}

	async countPendingByNotification(notificationId) {
		return this.model.countDocuments({ notificationId, status: { $in: ["PENDING", "QUEUED"] } });
	}
}
