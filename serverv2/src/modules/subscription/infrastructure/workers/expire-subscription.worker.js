export class ExpireSubscriptionWorker {
	constructor({
		expireSubscriptions
	}) {
		this.expireSubscriptions = expireSubscriptions;
	}
	
	async handle(job) {
		// console.log("📦 JOB:", job.data);
		console.log("🔥 Worker started for queue expire-subscriptions");
		const {
			subscriptionId
		} = job.data;

		const result = await this.expireSubscriptions.execute({
			subscriptionId
		});
		// console.log("✅ Subscription expired:", result);
	}
	async (job){
		// console.log("📦 JOB RECEIVED:", job.name, job.data);
		return workerHandler.handle(job);
	}
}