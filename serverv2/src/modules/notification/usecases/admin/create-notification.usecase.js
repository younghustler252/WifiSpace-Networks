import { Notification } from "../../domain/notification.entity.js";
import { NotificationRecipient } from "../../domain/notification-recipient.entity.js";
import { NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY } from "../../domain/notification.enum.js";

export class CreateNotification {
	constructor({ notificationRepository, notificationRecipientRepository, auditService }) {
		this.notificationRepository = notificationRepository;
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, type, title, message, userIds, channel = NOTIFICATION_CHANNEL.EMAIL, priority = NOTIFICATION_PRIORITY.NORMAL, accountId = null, ip = null }) {
		const notification = new Notification({ createdByAdminId: actorId, accountId, type, title, message, channel });
		const created = await this.notificationRepository.create(notification);

		for (const userId of userIds) {
			const recipient = new NotificationRecipient({ notificationId: created.id, userId, channel, priority });
			recipient.queue();
			await this.notificationRecipientRepository.create(recipient);
		}

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "NOTIFICATION_CREATED", entity: "Notification", entityId: created.id, newValue: { type, recipientCount: userIds.length }, ip });
		}

		return created;
	}
}