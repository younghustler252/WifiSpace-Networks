// repositories/notification.repository.js

import NotificationModel from "../models/notification.model.js";
import { NotificationMapper } from "../mappers/notification.mapper.js";

export class NotificationRepository {

    // ================= CREATE =================

    async create(notificationEntity) {

        const persistence = NotificationMapper.toPersistence(notificationEntity);

        const created = await NotificationModel.create(persistence);

        return NotificationMapper.toDomain(created);
    }


    // ================= FIND =================

    async findById(id) {

        const notification = await NotificationModel.findById(id);

        return NotificationMapper.toDomain(notification);
    }


    async findAll({
        type,
        state,
        channel,
        createdByAdminId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sort = { createdAt: -1 }
    }) {

        const query = {
            isArchived: false
        };

        if (type) query.type = type;
        if (state) query.state = state;
        if (channel) query.channel = channel;
        if (createdByAdminId) query.createdByAdminId = createdByAdminId;

        if (startDate || endDate) {

            query.createdAt = {};

            if (startDate) query.createdAt.$gte = startDate;
            if (endDate) query.createdAt.$lte = endDate;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([

            NotificationModel.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),

            NotificationModel.countDocuments(query)
        ]);

        return {
            data: data.map(NotificationMapper.toDomain),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }


    // ================= UPDATE =================

    async update(id, notificationEntity) {

        const persistence = NotificationMapper.toPersistence(notificationEntity);

        const updated = await NotificationModel.findByIdAndUpdate(
            id,
            persistence,
            { new: true }
        );

        return NotificationMapper.toDomain(updated);
    }


    async updateState(id, state) {

        const updated = await NotificationModel.findByIdAndUpdate(
            id,
            { state },
            { new: true }
        );

        return NotificationMapper.toDomain(updated);
    }


    // ================= ARCHIVE =================

    async archive(id) {

        const updated = await NotificationModel.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        return NotificationMapper.toDomain(updated);
    }


    // ================= DELETE =================

    async delete(id) {
        await NotificationModel.findByIdAndDelete(id);
    }


    // ================= ANALYTICS =================

    async countByState() {

        return NotificationModel.aggregate([
            {
                $group: {
                    _id: "$state",
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    async countByType() {

        return NotificationModel.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);
    }
}