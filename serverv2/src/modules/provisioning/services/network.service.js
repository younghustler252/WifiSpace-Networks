export class NetworkService {
	constructor({ mikrotikManager }) { // CHANGED: subscriptionRepository removed — no longer needed
		this.mikrotikManager = mikrotikManager;
	}

	async activate(subscription, metadata = {}) {
		return this._execute(() => this.mikrotikManager.provision(subscription, metadata));
	}

	async suspend(subscription, reason = "Subscription suspended") {
		return this._execute(() => this.mikrotikManager.suspend(subscription, reason));
	}

	async resume(subscription, metadata = {}) {
		return this._execute(() => this.mikrotikManager.resume(subscription, metadata));
	}

	async disconnect(subscription) {
		return this._execute(() => this.mikrotikManager.disconnect(subscription));
	}

	async remove(subscription) {
		return this._execute(() => this.mikrotikManager.remove(subscription));
	}

	async changePassword(subscription, password) {
		return this._execute(() => this.mikrotikManager.changePassword(subscription, password));
	}

	async retryProvision(subscription, metadata = {}) {
		return this.activate(subscription, metadata);
	}

	// NEW: for the roaming case — provisioning a router that ISN'T the
	// account's primary one.
	async activateOnRouter(subscription, router, metadata = {}) {
		return this._execute(() => this.mikrotikManager.provisionOnRouter(subscription, router, metadata));
	}

	// CHANGED: no longer writes to subscription.mikrotikStatus — that's
	// retired. MikrotikManager now records the real per-router outcome
	// itself (it's the only thing that actually knows which router was
	// touched). This is just an error boundary now.
	async _execute(action) {
		try {
			const result = await action();
			return { success: true, result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}
}