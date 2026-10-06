// usecases/admin/get-notification-recipients.usecase.js
export class GetNotificationRecipients {
	constructor({ notificationRecipientRepository }) { this.notificationRecipientRepository = notificationRecipientRepository; }
	async execute({ notificationId, page = 1, limit = 50 }) {
		return this.notificationRecipientRepository.paginate({ filter: { notificationId }, page, limit, sort: { createdAt: 1 } });
	}
}