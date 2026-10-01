export class NetworkService {
	constructor({ mikrotikManager, subscriptionRepository }) {
		this.mikrotikManager = mikrotikManager;
		this.subscriptionRepository = subscriptionRepository;
	}

	async activate(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.provision(subscription, metadata));
	}

	async suspend(subscription) {
		return this._execute(subscription, () => this.mikrotikManager.suspend(subscription));
	}

	async resume(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.resume(subscription, metadata));
	}

	async disconnect(subscription) {
		return this._execute(subscription, () => this.mikrotikManager.disconnect(subscription));
	}

	async remove(subscription) {
		return this._execute(subscription, () => this.mikrotikManager.remove(subscription));
	}

	async changePassword(subscription, password) {
		return this._execute(subscription, () => this.mikrotikManager.changePassword(subscription, password));
	}

	async retryProvision(subscription, metadata = {}) {
		return this.activate(subscription, metadata);
	}

	async _execute(subscription, action) {
		try {
			const result = await action();
			subscription.markMikrotikSynced();
			await this.subscriptionRepository.update(subscription.id, subscription);
			return { success: true, result };
		} catch (error) {
			subscription.markMikrotikFailed(error.message);
			await this.subscriptionRepository.update(subscription.id, subscription);
			return { success: false, error: error.message };
		}
	}
}