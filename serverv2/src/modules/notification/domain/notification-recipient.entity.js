import { NOTIFICATION_CHANNEL_LIST, NOTIFICATION_PRIORITY, NOTIFICATION_PRIORITY_LIST, NOTIFICATION_RECIPIENT_STATUS, NOTIFICATION_RECIPIENT_STATUS_LIST } from "./notification.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class NotificationRecipient {
	constructor({
		id, notificationId, userId, channel, priority = NOTIFICATION_PRIORITY.NORMAL, status = NOTIFICATION_RECIPIENT_STATUS.PENDING,
		retryCount = 0, maxRetries = 3, nextRetryAt = null, queuedAt = null, sentAt = null, deliveredAt = null, readAt = null,
		failedAt = null, cancelledAt = null, failedReason = null, providerMessageId = null, providerResponse = null,
		metadata = {}, isArchived = false, createdAt = null, updatedAt = null
	}) {
		if (!notificationId) throw new ValidationError("notificationId is required");
		if (!userId) throw new ValidationError("userId is required");
		if (!NOTIFICATION_CHANNEL_LIST.includes(channel)) throw new ValidationError(`Invalid notification channel: ${channel}`);
		if (!NOTIFICATION_PRIORITY_LIST.includes(priority)) throw new ValidationError(`Invalid notification priority: ${priority}`);
		if (!NOTIFICATION_RECIPIENT_STATUS_LIST.includes(status)) throw new ValidationError(`Invalid recipient status: ${status}`);

		Object.assign(this, {
			id, notificationId, userId, channel, priority, status, retryCount, maxRetries, nextRetryAt,
			queuedAt, sentAt, deliveredAt, readAt, failedAt, cancelledAt, failedReason,
			providerMessageId, providerResponse, metadata, isArchived, createdAt, updatedAt
		});
	}

	queue() { this.status = NOTIFICATION_RECIPIENT_STATUS.QUEUED; this.queuedAt = new Date(); }
	markAsSent(providerMessageId = null) { this.status = NOTIFICATION_RECIPIENT_STATUS.SENT; this.sentAt = new Date(); this.providerMessageId = providerMessageId; }
	markAsDelivered() { this.status = NOTIFICATION_RECIPIENT_STATUS.DELIVERED; this.deliveredAt = new Date(); }
	markAsRead() { this.status = NOTIFICATION_RECIPIENT_STATUS.READ; this.readAt = new Date(); }

	markAsFailed(reason = null) {
		this.status = NOTIFICATION_RECIPIENT_STATUS.FAILED;
		this.failedAt = new Date();
		this.failedReason = reason;
		this.retryCount += 1;
		const delayMinutes = Math.pow(2, this.retryCount);
		this.nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
	}

	cancel() { this.status = NOTIFICATION_RECIPIENT_STATUS.CANCELLED; this.cancelledAt = new Date(); }
	archive() { this.isArchived = true; }
	canRetry() { return this.retryCount < this.maxRetries; }

	retry() {
		this.status = NOTIFICATION_RECIPIENT_STATUS.QUEUED;
		this.failedReason = null;
		this.failedAt = null;
		this.nextRetryAt = null;
		this.queuedAt = new Date();
	}

	toJSON() { return { ...this }; }
}