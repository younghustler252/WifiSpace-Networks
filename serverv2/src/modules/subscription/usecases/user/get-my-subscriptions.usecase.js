export class GetMySubscriptions {
	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ userId }) {
		return this.subscriptionRepository.findByUserId(userId);
	}
}