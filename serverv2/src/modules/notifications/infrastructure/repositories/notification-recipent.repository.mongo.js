// repositories/notification-recipent.repository.js

import NotificationRecipientModel from "../models/notificationRecipient.model.js";
import { NotificationRecipientMapper } from "../mappers/notificationRecipient.mapper.js";

export class NotificationRecipientRepository {

    // ================= CREATE =================

    async create(recipientEntity) {

        const persistence = NotificationRecipientMapper.toPersistence(recipientEntity);

        const created = await NotificationRecipientModel.create(persistence);

        return NotificationRecipientMapper.toDomain(created);
    }


    async createMany(recipientEntities) {

        const persistence = recipientEntities.map(
            NotificationRecipientMapper.toPersistence
        );

        const created = await NotificationRecipientModel.insertMany(persistence);

        return created.map(NotificationRecipientMapper.toDomain);
    }


    // ================= FIND =================

    async findById(id) {

        const doc = await NotificationRecipientModel.findById(id);

        return NotificationRecipientMapper.toDomain(doc);
    }


    async findByNotification(notificationId) {

        const docs = await NotificationRecipientModel.find({
            notificationId,
            isArchived: false
        });

        return docs.map(NotificationRecipientMapper.toDomain);
    }


    async findByUser(userId, {
        status,
        channel,
        page = 1,
        limit = 20
    } = {}) {

        const query = {
            userId,
            isArchived: false
        };

        if (status) query.status = status;
        if (channel) query.channel = channel;

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([

            NotificationRecipientModel.find(query)
                .populate("notificationId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            NotificationRecipientModel.countDocuments(query)
        ]);

        return {
            data: data.map(NotificationRecipientMapper.toDomain),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }


    async findUnreadByUser(userId) {

        const docs = await NotificationRecipientModel.find({
            userId,
            status: {
                $in: ["PENDING", "QUEUED", "SENT", "DELIVERED"]
            },
            isArchived: false
        }).sort({ createdAt: -1 });

        return docs.map(NotificationRecipientMapper.toDomain);
    }


    async findFailedForRetry(limit = 100) {

        const docs = await NotificationRecipientModel.find({
            status: "FAILED",
            nextRetryAt: { $lte: new Date() },
            isArchived: false
        })
        .sort({ priority: -1, createdAt: 1 })
        .limit(limit);

        return docs.map(NotificationRecipientMapper.toDomain);
    }

    // ================= QUEUE =================

    async findQueuedRecipients(limit = 100) {

        const docs = await NotificationRecipientModel.find({

            status: "QUEUED",

            isArchived: false

        })
        .sort({
            createdAt: 1
        })
        .limit(limit);

        return docs.map(
            NotificationRecipientMapper.toDomain
        );
    }
    // ================= UPDATE =================

    async update(id, recipientEntity) {

        const persistence = NotificationRecipientMapper.toPersistence(recipientEntity);

        const updated = await NotificationRecipientModel.findByIdAndUpdate(
            id,
            persistence,
            { new: true }
        );

        return NotificationRecipientMapper.toDomain(updated);
    }


    async updateStatus(id, status, extra = {}) {

        const updated = await NotificationRecipientModel.findByIdAndUpdate(
            id,
            {
                status,
                ...extra
            },
            { new: true }
        );

        return NotificationRecipientMapper.toDomain(updated);
    }


    async markAsRead(id) {

        const updated = await NotificationRecipientModel.findByIdAndUpdate(
            id,
            {
                status: "READ",
                readAt: new Date()
            },
            { new: true }
        );

        return NotificationRecipientMapper.toDomain(updated);
    }


    // ================= BULK =================

    async bulkUpdateStatus(ids, status) {

        return NotificationRecipientModel.updateMany(
            { _id: { $in: ids } },
            { $set: { status } }
        );
    }


    // ================= ARCHIVE =================

    async archive(id) {

        const updated = await NotificationRecipientModel.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        return NotificationRecipientMapper.toDomain(updated);
    }


    // ================= DELETE =================

    async delete(id) {
        await NotificationRecipientModel.findByIdAndDelete(id);
    }


    // ================= ANALYTICS =================

    async countByStatus(notificationId) {

        return NotificationRecipientModel.aggregate([
            { $match: { notificationId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
    }


    async deliveryAnalytics(notificationId) {

        return NotificationRecipientModel.aggregate([
            { $match: { notificationId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },

                    delivered: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0]
                        }
                    },

                    read: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "READ"] }, 1, 0]
                        }
                    },

                    failed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0]
                        }
                    }
                }
            }
        ]);
    }
}