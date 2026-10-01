export class GetUsageStats {
	constructor({ usageSummaryRepository }) {
		this.usageSummaryRepository = usageSummaryRepository;
	}
	async execute({ subscriptionId }) {
		return this.usageSummaryRepository.findBySubscriptionId(subscriptionId);
	}
}