// src/infrastructure/mikrotik/HotspotIntegration.js
import { mikrotikClient } from "./MikrotikClient.js";

export class HotspotIntegration {
	constructor(client = mikrotikClient) {
		this.client = client;
	}

	// ----------------------------
	// Create / Activate Hotspot user for an account
	// ----------------------------
	async createAccount(account) {
		const { wsnId, pppoePassword, routerProfile } = account;
		if (!wsnId || !pppoePassword)
			throw new Error("Account must have wsnId and password");

		await this.client.execute("/ip/hotspot/user/add", {
			name: wsnId,
			password: pppoePassword,
			profile: routerProfile || "default",
			disabled: false
		});

		return true;
	}

	// ----------------------------
	// Suspend Hotspot account
	// ----------------------------
	async suspendAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ip/hotspot/user/disable", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Resume / Reactivate Hotspot account
	// ----------------------------
	async resumeAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ip/hotspot/user/enable", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Remove / Cancel Hotspot account
	// ----------------------------
	async removeAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ip/hotspot/user/remove", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Update Hotspot account profile or password
	// ----------------------------
	async updateAccount(account, updates = {}) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		const params = { numbers: wsnId };
		if (updates.routerProfile) params.profile = updates.routerProfile;
		if (updates.pppoePassword) params.password = updates.pppoePassword;

		await this.client.execute("/ip/hotspot/user/set", params);
		return true;
	}

	// ----------------------------
	// Fetch active Hotspot session for an account
	// ----------------------------
	async fetchActiveSession(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		const sessions = await this.client.execute("/ip/hotspot/active");
		const session = sessions.find(s => s.user === wsnId);

		if (!session) return null;

		return {
			sessionId: session[".id"],
			wsnId: session.user,
			ipAddress: session.address,
			macAddress: session.mac || null,
			bytesIn: Number(session["bytes-in"] || 0),
			bytesOut: Number(session["bytes-out"] || 0),
			uptime: Number(session.uptime || 0),
			startedAt: new Date() // approximate
		};
	}

	// ----------------------------
	// Fetch all active Hotspot sessions (monitoring)
	// ----------------------------
	async fetchAllActiveSessions() {
		const sessions = await this.client.execute("/ip/hotspot/active");

		return sessions.map(s => ({
			sessionId: s[".id"],
			wsnId: s.user,
			ipAddress: s.address,
			macAddress: s.mac || null,
			bytesIn: Number(s["bytes-in"] || 0),
			bytesOut: Number(s["bytes-out"] || 0),
			uptime: Number(s.uptime || 0),
			startedAt: new Date()
		}));
	}
}