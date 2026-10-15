// modules/provisioning/services/network-executor.service.js
export class NetworkExecutor {
	constructor({ mikrotikManager, subscriptionRepository }) {
		this.mikrotikManager = mikrotikManager;
		this.subscriptionRepository = subscriptionRepository;
	}

	activate(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.provision(subscription, metadata));
	}

	suspend(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.suspend(subscription, metadata));
	}

	resume(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.resume(subscription, metadata));
	}

	disconnect(subscription, metadata = {}) {
		return this._execute(subscription, () => this.mikrotikManager.disconnect(subscription, metadata));
	}

	// NetworkExecutor
	async disconnectDevice(subscription, metadata = {}) {
		try {
			const result = await this.mikrotikManager.disconnectDevice(subscription, metadata);
			return { success: true, result };
		} catch (error) {
			return { success: false, error: error.message || "Unknown provisioning error" };
		}
	}

	async remove(subscription, metadata = {}) {
		try {
			const result = await this.mikrotikManager.remove(subscription, metadata);
			return { success: true, result };
		} catch (error) {
			return { success: false, error: error.message || "Unknown provisioning error" };
		}
	}

	async _execute(subscription, action) {
		try {
			const result = await action();
			subscription.markMikrotikSynced();
			await this._persistSyncState(subscription);
			return { success: true, result };
		} catch (error) {
			const message = error.message || "Unknown provisioning error";
			subscription.markMikrotikFailed(message);
			await this._persistSyncState(subscription);
			return { success: false, error: message };
		}
	}

	_persistSyncState(subscription) {
		return this.subscriptionRepository.update(subscription.id, {
			mikrotikStatus: subscription.mikrotikStatus,
			mikrotikError: subscription.mikrotikError,
			mikrotikLastSyncAt: subscription.mikrotikLastSyncAt
		});
	}
}