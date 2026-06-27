export class ProvisionSubscriptionWorker {
	constructor({ syncProvisioning }) {
		this.syncProvisioning = syncProvisioning;
	}
	
	async handle(job) {
		console.log(`📡 Processing network activation queue for Job ID: ${job.id}`);
		const { subscriptionId, context } = job.data;

		return await this.syncProvisioning.execute({
			subscriptionId,
			context
		});
	}
}
