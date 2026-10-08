import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { NOTIFICATION_ERROR_CODES } from "../../domain/notification.enum.js";

export class MarkNotificationRead {
	constructor({ notificationRecipientRepository }) {
		this.notificationRecipientRepository = notificationRecipientRepository;
	}
	async execute({ userId, recipientId }) {
		const recipient = await this.notificationRecipientRepository.findById(recipientId);
		if (!recipient || recipient.userId !== userId) throw new NotFoundError("Notification not found", NOTIFICATION_ERROR_CODES.RECIPIENT_NOT_FOUND);
		recipient.markAsRead();
		return this.notificationRecipientRepository.update(recipient.id, recipient);
	}
}