export class DispatchNotifications {
	constructor({ notificationRecipientRepository, userRepository, channelRegistry }) {
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.userRepository = userRepository;
		this.channelRegistry = channelRegistry;
	}

	async execute() {
		const [pending, dueRetries] = await Promise.all([
			this.notificationRecipientRepository.findPendingByPriority(),
			this.notificationRecipientRepository.findDueForRetry()
		]);

		let sent = 0, failed = 0;

		for (const recipient of [...pending, ...dueRetries]) {
			try {
				const user = await this.userRepository.findById(recipient.userId);
				if (!user) { recipient.cancel(); await this.notificationRecipientRepository.update(recipient.id, recipient); continue; }

				const provider = this.channelRegistry.get(recipient.channel);
				const to = recipient.channel === "email" ? user.email : user.phone;
				if (!to) { recipient.markAsFailed("Recipient has no contact info for this channel"); await this.notificationRecipientRepository.update(recipient.id, recipient); continue; }

				const result = await provider.send({ to, subject: recipient.metadata?.title, message: recipient.metadata?.message, metadata: recipient.metadata });

				recipient.markAsSent(result.providerMessageId);
				sent++;
			} catch (err) {
				recipient.markAsFailed(err.message);
				if (!recipient.canRetry()) recipient.cancel();
				failed++;
			}
			await this.notificationRecipientRepository.update(recipient.id, recipient);
		}

		return { checked: pending.length + dueRetries.length, sent, failed };
	}
}
