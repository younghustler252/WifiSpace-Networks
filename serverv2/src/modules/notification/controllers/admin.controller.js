// modules/notifications/controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ createNotification, getAllNotifications, getNotificationRecipients }) {
		this.createNotificationUseCase = createNotification;
		this.getAllNotificationsUseCase = getAllNotifications;
		this.getNotificationRecipientsUseCase = getNotificationRecipients;
	}

	createNotification = async (req, res) => {
		const notification = await this.createNotificationUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: notification.toJSON(), message: "Notification created successfully", statusCode: 201 });
	};

	getAllNotifications = async (req, res) => {
		const { data, meta } = await this.getAllNotificationsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((n) => n.toJSON()), meta, message: "Notifications fetched successfully" });
	};

	getNotificationRecipients = async (req, res) => {
		const { data, meta } = await this.getNotificationRecipientsUseCase.execute({
			notificationId: req.params.id,
			page: req.query.page,
			limit: req.query.limit,
		});

		return paginatedResponse({
			res,
			data: data.map((recipient) => recipient.toJSON()),
			meta,
			message: "Notification recipients fetched successfully",
		});
	};

}