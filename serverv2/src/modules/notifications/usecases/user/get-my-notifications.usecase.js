// usecases/user/get-my-notifications.usecase.js — corrected return shape
export class GetMyNotifications {
	constructor({ notificationRecipientRepository }) {
		this.notificationRecipientRepository = notificationRecipientRepository;
	}
	async execute({ userId, status, page = 1, limit = 20 }) {
		return this.notificationRecipientRepository.findByUser(userId, { status, page, limit });
	}
}