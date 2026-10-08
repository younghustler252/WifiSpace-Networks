// modules/provisioning/services/network.service.js
import { provisioningQueue } from "../../../infrastructure/jobs/queues/provisioning.queue.js";
import { SERVICE_TYPES } from "../../../shared/constants/service-type.enum.js";

const JOB_OPTIONS = { attempts: 6, backoff: { type: "exponential", delay: 10000 }, removeOnComplete: 100, removeOnFail: 200 };

export class NetworkService {
	constructor({ subscriptionRepository, accountRepository, routerProvisioningRepository }) {
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	activate(subscription, metadata = {}) { return this._route("activate", subscription, metadata); }
	suspend(subscription, metadata = {}) { return this._route("suspend", subscription, metadata); }
	resume(subscription, metadata = {}) { return this._route("resume", subscription, metadata); }
	disconnect(subscription, metadata = {}) { return this._route("disconnect", subscription, metadata); }
	remove(subscription, metadata = {}) { return this._route("remove", subscription, metadata); }
	retryProvision(subscription, metadata = {}) { return this.activate(subscription, metadata); }

	async _route(action, subscription, metadata) {
		if (metadata.routerId) return this._enqueue(action, subscription, metadata);

		const account = await this.accountRepository.findById(subscription.accountId);
		if (account?.serviceType !== SERVICE_TYPES.HOTSPOT) return this._enqueue(action, subscription, metadata);

		const known = await this.routerProvisioningRepository.findByAccount(account.id);
		if (!known.length) {
			const status = ["activate", "resume"].includes(action) ? "awaiting_device" : "skipped";
			return { success: true, queued: false, provisioning: { status } };
		}

		const results = await Promise.all(known.map((entry) => this._enqueue(action, subscription, { ...metadata, routerId: entry.routerId })));
		return results.find((result) => !result.success) ?? { success: true, queued: true, provisioning: { status: "pending" } };
	}

	async _enqueue(action, subscription, metadata) {
		try {
			await this.subscriptionRepository.update(subscription.id, { mikrotikStatus: "pending", mikrotikError: null });
			const job = await provisioningQueue.add(action, { action, subscriptionId: subscription.id, metadata }, JOB_OPTIONS);
			return { success: true, queued: true, provisioning: { status: "pending", jobId: job.id } };
		} catch (error) {
			const message = error.message || "Could not queue provisioning";
			await this.subscriptionRepository.update(subscription.id, { mikrotikStatus: "failed", mikrotikError: message }).catch(() => {});
			return { success: false, queued: false, error: message, provisioning: { status: "failed", error: message } };
		}
	}
}