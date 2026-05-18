import { NotificationMapper } from "../mapper/notification.mapper.js";
import NotificationModel from "../database/mongoose/notification.model.js";

export class NotificationRepository {
    /**
     * Create a new notification (single user or broadcast)
     * @param {Notification} entity 
     * @returns {Promise<Notification>}
     */
    async create(entity) {
        return NotificationMapper.save(entity);
    }

    /**
     * Find notification by ID
     * @param {string} id 
     * @returns {Promise<Notification|null>}
     */
    async findById(id) {
        const doc = await NotificationModel.findById(id);
        return NotificationMapper.toEntity(doc);
    }

    /**
     * Get notifications for a user
     * @param {string} userId 
     * @param {Object} options 
     * @param {string} [options.status] - unread, read, sent, failed
     * @param {string} [options.type] - notification type
     * @param {number} [options.limit] 
     * @param {number} [options.skip] 
     * @returns {Promise<Notification[]>}
     */
    async getByUser(userId, { status, type, limit = 50, skip = 0 } = {}) {
        const query = {
            $or: [
                { userId },
                { targetUsers: userId } // for broadcast notifications
            ]
        };

        if (status) query.status = status;
        if (type) query.type = type;

        const docs = await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return docs.map(NotificationMapper.toEntity);
    }

    /**
     * Mark a notification as read
     * @param {string} id 
     * @returns {Promise<Notification|null>}
     */
    async markAsRead(id) {
        const doc = await NotificationModel.findByIdAndUpdate(
            id,
            { status: "read" },
            { new: true }
        );
        return NotificationMapper.toEntity(doc);
    }

    /**
     * Mark all notifications for a user as read
     * @param {string} userId 
     * @returns {Promise<number>} - number of notifications updated
     */
    async markAllAsRead(userId) {
        const result = await NotificationModel.updateMany(
            { 
                $or: [
                    { userId },
                    { targetUsers: userId }
                ],
                status: "unread"
            },
            { status: "read" }
        );
        return result.modifiedCount;
    }

    /**
     * Update notification (status, metadata, etc.)
     * @param {Notification} entity 
     * @returns {Promise<Notification|null>}
     */
    async update(entity) {
        return NotificationMapper.update(entity);
    }

    /**
     * Find notifications by filter
     * @param {Object} filter - MongoDB filter object
     * @param {Object} options - {limit, skip, sort}
     * @returns {Promise<Notification[]>}
     */
    async find(filter = {}, options = {}) {
        const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
        const docs = await NotificationModel.find(filter).sort(sort).skip(skip).limit(limit);
        return docs.map(NotificationMapper.toEntity);
    }
}