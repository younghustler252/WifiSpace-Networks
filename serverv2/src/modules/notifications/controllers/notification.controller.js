// modules/notifications/controllers/notification.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class NotificationController {
	constructor({ getMyNotifications, markNotificationRead, markAllNotificationsRead }) {
		this.getMyNotificationsUseCase = getMyNotifications;
		this.markNotificationReadUseCase = markNotificationRead;
		this.markAllNotificationsReadUseCase = markAllNotificationsRead;
	}

	getMyNotifications = async (req, res) => {
        const { data, meta } = await this.getMyNotificationsUseCase.execute({ userId: req.user.id, ...req.query });
        return paginatedResponse({ res, data: data.map((n) => n.toJSON()), meta, message: "Notifications fetched successfully" });
    };

	markAllRead = async (req, res) => {
		const result = await this.markAllNotificationsReadUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: result, message: "All notifications marked as read" });
	};

	markRead = async (req, res) => {
		const recipient = await this.markNotificationReadUseCase.execute({ userId: req.user.id, recipientId: req.params.id });
		return successResponse({ res, data: recipient.toJSON(), message: "Notification marked as read" });
	};
}