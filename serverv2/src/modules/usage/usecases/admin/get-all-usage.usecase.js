export class GetAllUsage {
	constructor({ usageRepository }) {
		this.usageRepository = usageRepository;
	}
	async execute({ subscriptionId, page = 1, limit = 20 }) {
		return this.usageRepository.findBySubscription(subscriptionId, { page, limit });
	}
}