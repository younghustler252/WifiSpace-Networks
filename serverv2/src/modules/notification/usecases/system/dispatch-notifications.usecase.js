// notifications/usecases/system/dispatch-notifications.usecase.js
export class DispatchNotifications {
	constructor({ notificationRecipientRepository, notificationRepository, userRepository, channelRegistry }) {
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
		this.channelRegistry = channelRegistry;
	}

	async execute() {
		const [pending, dueRetries] = await Promise.all([
			this.notificationRecipientRepository.findPendingByPriority(),
			this.notificationRecipientRepository.findDueForRetry()
		]);

		const touchedNotificationIds = new Set();
		let sent = 0;
		let failed = 0;

		for (const recipient of [...pending, ...dueRetries]) {
			touchedNotificationIds.add(recipient.notificationId);

			try {
				const user = await this.userRepository.findById(recipient.userId);
				if (!user) {
					recipient.cancel();
					await this.notificationRecipientRepository.update(recipient.id, recipient);
					continue;
				}

				const to = recipient.channel === "email" ? user.email : user.phone;
				if (recipient.channel !== "in_app" && !to) {
					recipient.markAsFailed("Recipient has no contact info for this channel");
					if (!recipient.canRetry()) recipient.cancel();
					await this.notificationRecipientRepository.update(recipient.id, recipient);
					failed++;
					continue;
				}

				const provider = this.channelRegistry.get(recipient.channel);
				const result = await provider.send({ to, name: user.firstName, subject: recipient.metadata?.title, message: recipient.metadata?.message, metadata: recipient.metadata });

				recipient.markAsSent(result.providerMessageId);
				sent++;
			} catch (err) {
				recipient.markAsFailed(err.message);
				if (!recipient.canRetry()) recipient.cancel();
				failed++;
			}

			await this.notificationRecipientRepository.update(recipient.id, recipient);
		}

		for (const notificationId of touchedNotificationIds) {
			const stillPending = await this.notificationRecipientRepository.countPendingByNotification(notificationId);
			if (stillPending === 0) {
				const notification = await this.notificationRepository.findById(notificationId);
				if (notification && notification.state !== "COMPLETED") {
					notification.complete();
					await this.notificationRepository.update(notification.id, notification);
				}
			}
		}

		return { checked: pending.length + dueRetries.length, sent, failed };
	}
}