import NotificationModel from "../../infrastructure/database/mongoose/notification.model.js";
import { Notification } from "../../domain/notification.entity.js";

export class NotificationMapper {
    /**
     * Convert Mongoose document to Notification entity
     * @param {Object} doc - Mongoose notification document
     * @returns {Notification}
     */
    static toEntity(doc) {
        if (!doc) return null;

        return new Notification({
            id: doc._id.toString(),
            userId: doc.userId ? doc.userId.toString() : null,
            targetUsers: doc.targetUsers ? doc.targetUsers.map(u => u.toString()) : [],
            accountId: doc.accountId ? doc.accountId.toString() : null,
            subscriptionId: doc.subscriptionId ? doc.subscriptionId.toString() : null,
            createdByAdminId: doc.createdByAdminId ? doc.createdByAdminId.toString() : null,
            type: doc.type,
            title: doc.title,
            message: doc.message,
            channel: doc.channel,
            status: doc.status,
            metadata: doc.metadata || {},
            sentAt: doc.sentAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    /**
     * Convert Notification entity to plain object for Mongoose
     * @param {Notification} entity 
     * @returns {Object}
     */
    static toPersistence(entity) {
        return {
            userId: entity.userId,
            targetUsers: entity.targetUsers,
            accountId: entity.accountId,
            subscriptionId: entity.subscriptionId,
            createdByAdminId: entity.createdByAdminId,
            type: entity.type,
            title: entity.title,
            message: entity.message,
            channel: entity.channel,
            status: entity.status,
            metadata: entity.metadata,
            sentAt: entity.sentAt
        };
    }

    /**
     * Save Notification entity to DB
     * @param {Notification} entity 
     * @returns {Promise<Notification>}
     */
    static async save(entity) {
        const data = NotificationMapper.toPersistence(entity);
        const doc = await NotificationModel.create(data);
        return NotificationMapper.toEntity(doc);
    }

    /**
     * Update existing notification in DB
     * @param {Notification} entity
     * @returns {Promise<Notification>}
     */
    static async update(entity) {
        const data = NotificationMapper.toPersistence(entity);
        const doc = await NotificationModel.findByIdAndUpdate(entity.id, data, { new: true });
        return NotificationMapper.toEntity(doc);
    }
}