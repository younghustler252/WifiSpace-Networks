export class MarkAllNotificationsRead {
	constructor({ notificationRecipientRepository }) {
		this.notificationRecipientRepository = notificationRecipientRepository;
	}
	async execute({ userId }) {
		const updated = await this.notificationRecipientRepository.markAllReadForUser(userId);
		return { updated };
	}
}
