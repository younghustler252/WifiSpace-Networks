export class ExpireSubscriptionWorker {
	constructor({
		expireSubscriptions
	}) {
		this.expireSubscriptions = expireSubscriptions;
	}
	
	async handle(job) {
		console.log(`🔥 Worker processing queue expire-subscriptions for Job ID: ${job.id}`);
		const { subscriptionId } = job.data;

		// Hand off processing payload variables directly down to usecase thread
		const result = await this.expireSubscriptions.execute({
			subscriptionId
		});
		
		return result;
	}
}
