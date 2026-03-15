// src/infrastructure/mikrotik/PPPoEIntegration.js
import { mikrotikClient } from "./MikrotikClient.js";

export class PPPoEIntegration {
	constructor(client = mikrotikClient) {
		this.client = client;
	}

	// ----------------------------
	// Create / Activate a PPPoE user for an account
	// ----------------------------
	async createAccount(account) {
		const { wsnId, pppoePassword, routerProfile } = account;
		if (!wsnId || !pppoePassword)
			throw new Error("Account must have wsnId and pppoePassword");

		await this.client.execute("/ppp/secret/add", {
			name: wsnId,
			password: pppoePassword,
			profile: routerProfile || "default",
			service: "pppoe",
			disabled: false
		});

		return true;
	}

	// ----------------------------
	// Suspend account
	// ----------------------------
	async suspendAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ppp/secret/disable", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Resume / Reactivate account
	// ----------------------------
	async resumeAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ppp/secret/enable", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Remove / Cancel account
	// ----------------------------
	async removeAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		await this.client.execute("/ppp/secret/remove", { numbers: wsnId });
		return true;
	}

	// ----------------------------
	// Update account profile or password
	// ----------------------------
	async updateAccount(account, updates = {}) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		const params = { numbers: wsnId };
		if (updates.routerProfile) params.profile = updates.routerProfile;
		if (updates.pppoePassword) params.password = updates.pppoePassword;

		await this.client.execute("/ppp/secret/set", params);
		return true;
	}

	// ----------------------------
	// Fetch active PPPoE sessions for account
	// ----------------------------
	async fetchActiveSession(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		const sessions = await this.client.execute("/ppp/active");
		const session = sessions.find(s => s.name === wsnId);

		if (!session) return null;

		return {
			sessionId: session[".id"],
			wsnId: session.name,
			ipAddress: session.address,
			macAddress: session["caller-id"] || null,
			bytesIn: Number(session["bytes-in"] || 0),
			bytesOut: Number(session["bytes-out"] || 0),
			uptime: Number(session.uptime || 0),
			startedAt: new Date() // approximate
		};
	}

	async disconnectAccount(account) {
		const { wsnId } = account;
		if (!wsnId) throw new Error("wsnId is required");

		const sessions = await this.client.execute("/ppp/active/print");

		const session = sessions.find(s => s.name === wsnId);

		if (!session) return false;

		await this.client.execute("/ppp/active/remove", {
			numbers: session[".id"]
		});

		return true;
	}

	// ----------------------------
	// Fetch all active PPPoE sessions (for monitoring)
	// ----------------------------
	async fetchAllActiveSessions() {
		const sessions = await this.client.execute("/ppp/active");

		return sessions.map(s => ({
			sessionId: s[".id"],
			wsnId: s.name,
			ipAddress: s.address,
			macAddress: s["caller-id"] || null,
			bytesIn: Number(s["bytes-in"] || 0),
			bytesOut: Number(s["bytes-out"] || 0),
			uptime: Number(s.uptime || 0),
			startedAt: new Date()
		}));
	}
}