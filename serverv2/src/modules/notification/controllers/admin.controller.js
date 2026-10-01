// modules/notifications/controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ createNotification, getAllNotifications }) {
		this.createNotificationUseCase = createNotification;
		this.getAllNotificationsUseCase = getAllNotifications;
	}

	createNotification = async (req, res) => {
		const notification = await this.createNotificationUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: notification.toJSON(), message: "Notification created successfully", statusCode: 201 });
	};

	getAllNotifications = async (req, res) => {
		const { data, meta } = await this.getAllNotificationsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((n) => n.toJSON()), meta, message: "Notifications fetched successfully" });
	};
}