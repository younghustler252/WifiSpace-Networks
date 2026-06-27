export class ExpireSubscriptionWorker {
	constructor({
		expireSubscriptions
	}) {
		this.expireSubscriptions = expireSubscriptions;
	}
	
	async handle(job) {
		console.log(`🔥 Worker processing queue expire-subscriptions for Job ID: ${job.id}`);
		
		// Extract both the subscription ID and the context payload from the Redis job data
		const { subscriptionId, context } = job.data;

		// Hand off both parameters directly to your use case logic
		const result = await this.expireSubscriptions.execute({
			subscriptionId,
			context
		});
		
		return result;
	}
}
