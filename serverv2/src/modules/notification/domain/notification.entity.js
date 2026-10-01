import { NOTIFICATION_TYPE_LIST, NOTIFICATION_CHANNEL, NOTIFICATION_CHANNEL_LIST, NOTIFICATION_STATE, NOTIFICATION_STATE_LIST } from "./notification.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Notification {
	constructor({
		id, accountId = null, subscriptionId = null, createdByAdminId = null,
		type, title, message, channel = NOTIFICATION_CHANNEL.EMAIL, state = NOTIFICATION_STATE.QUEUED,
		metadata = {}, sentAt = null, completedAt = null, cancelledAt = null, isArchived = false,
		createdAt = null, updatedAt = null
	}) {
		if (!NOTIFICATION_TYPE_LIST.includes(type)) throw new ValidationError(`Invalid notification type: ${type}`);
		if (!NOTIFICATION_CHANNEL_LIST.includes(channel)) throw new ValidationError(`Invalid notification channel: ${channel}`);
		if (!NOTIFICATION_STATE_LIST.includes(state)) throw new ValidationError(`Invalid notification state: ${state}`);
		if (!title?.trim()) throw new ValidationError("Notification title is required");
		if (!message?.trim()) throw new ValidationError("Notification message is required");

		Object.assign(this, {
			id, accountId, subscriptionId, createdByAdminId, type, title: title.trim(), message: message.trim(),
			channel, state, metadata, sentAt, completedAt, cancelledAt, isArchived, createdAt, updatedAt
		});
	}

	startProcessing() { this.state = NOTIFICATION_STATE.PROCESSING; }
	complete() { this.state = NOTIFICATION_STATE.COMPLETED; this.completedAt = new Date(); }
	cancel() { this.state = NOTIFICATION_STATE.CANCELLED; this.cancelledAt = new Date(); }
	archive() { this.isArchived = true; }

	toJSON() { return { ...this }; }
}