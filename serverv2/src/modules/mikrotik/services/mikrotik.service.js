// src/services/mikrotik.service.js
import { PPPoEIntegration } from "../infrastructure/mikrotik/PPPoEIntegration.js";
import { HotspotIntegration } from "../infrastructure/mikrotik/HotspotIntegration.js";
import { ValidationError } from "../shared/error/validation-error.js";

export class MikrotikService {
	constructor({ pppoeIntegration = new PPPoEIntegration(), hotspotIntegration = new HotspotIntegration() } = {}) {
		this.pppoeIntegration = pppoeIntegration;
		this.hotspotIntegration = hotspotIntegration;
	}

	// ----------------------------
	// Helper to select integration
	// ----------------------------
	_integrationFor(account) {
		if (!account || !account.serviceType) throw new ValidationError("Account or serviceType is missing");
		if (account.serviceType === "pppoe") return this.pppoeIntegration;
		if (account.serviceType === "hotspot") return this.hotspotIntegration;
		throw new ValidationError(`Unsupported serviceType: ${account.serviceType}`);
	}

	// ----------------------------
	// Create / Activate Account
	// ----------------------------
	async createAccount(account) {
		const integration = this._integrationFor(account);
		return integration.createUser({
			wsnId: account.wsnId,
			password: account.pppoePassword || account.hotspotPassword,
			profile: account.routerProfile
		});
	}

	// ----------------------------
	// Suspend Account
	// ----------------------------
	async suspendAccount(account) {
		const integration = this._integrationFor(account);
		return integration.suspendUser(account.wsnId);
	}

	// ----------------------------
	// Resume Account
	// ----------------------------
	async resumeAccount(account) {
		const integration = this._integrationFor(account);
		return integration.resumeUser(account.wsnId);
	}

	// ----------------------------
	// Remove / Cancel Account
	// ----------------------------
	async removeAccount(account) {
		const integration = this._integrationFor(account);
		return integration.removeUser(account.wsnId);
	}

	// ----------------------------
	// Update Profile / Plan
	// ----------------------------
	async updateAccountProfile(account, newProfile) {
		const integration = this._integrationFor(account);
		return integration.updateProfile(account.wsnId, newProfile);
	}

	// ----------------------------
	// Fetch Active Sessions
	// ----------------------------
	async fetchActiveSessions(serviceType = null) {
		if (serviceType === "pppoe") return this.pppoeIntegration.fetchActiveSessions();
		if (serviceType === "hotspot") return this.hotspotIntegration.fetchActiveSessions();
		// Both
		const pppoeSessions = await this.pppoeIntegration.fetchActiveSessions();
		const hotspotSessions = await this.hotspotIntegration.fetchActiveSessions();
		return [...pppoeSessions, ...hotspotSessions];
	}

	// ----------------------------
	// Fetch Last Seen
	// ----------------------------
	async fetchLastSeen(serviceType = null) {
		if (serviceType === "pppoe") return this.pppoeIntegration.fetchLastSeen();
		if (serviceType === "hotspot") return this.hotspotIntegration.fetchLastSeen();
		const pppoeLastSeen = await this.pppoeIntegration.fetchLastSeen();
		const hotspotLastSeen = await this.hotspotIntegration.fetchLastSeen();
		return [...pppoeLastSeen, ...hotspotLastSeen];
	}

	// ----------------------------
	// Other Helper Methods
	// ----------------------------

	// Example: Reset password
	async resetAccountPassword(account, newPassword) {
		const integration = this._integrationFor(account);
		return integration.updateProfile(account.wsnId, account.routerProfile, newPassword);
	}

	async disconnectAccount(account) {
		const integration = this._integrationFor(account);
		return integration.disconnectUser(account.wsnId);
	}
}
