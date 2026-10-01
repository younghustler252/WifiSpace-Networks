// repositories/notification-recipient.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import NotificationRecipientModel from "../database/notification-recipient.model.js";
import { NotificationRecipientMapper } from "../mappers/notification-recipient.mapper.js";

export class NotificationRecipientRepositoryMongo extends BaseRepository {
	constructor() { super(NotificationRecipientModel, NotificationRecipientMapper); }

	async findByNotificationId(notificationId) {
		const docs = await this.model.find({ notificationId }).lean();
		return this.mapArray(docs);
	}

	async findByUser(userId, { status } = {}) {
		const filter = { userId };
		if (status) filter.status = status;
		return this.paginate({ filter, sort: { createdAt: -1 } });
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
}