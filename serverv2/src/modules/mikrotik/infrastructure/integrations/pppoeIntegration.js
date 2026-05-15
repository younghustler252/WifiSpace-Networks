import { mikrotikClient } from "../client/mikrotik.client.js";

export class PppoeIntegration {
	constructor(router) {
		this.router = router;
	}

	// ==================================================
	// Create PPPoE Secret (Provision User)
	// ==================================================
	async createUser(account) {
		const params = [
			`/ppp/secret/add`,
			`=name=${account.wsnId}`,
			`=password=${account.pppoePassword}`,
			`=service=pppoe`,
			`=profile=${account.routerProfile || "default"}`,
		];

		return mikrotikClient.execute(
			this.router,
			"/ppp/secret/add",
			params
		);
	}

	// ==================================================
	// Disable User (Suspend)
	// ==================================================
	async suspendUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ppp/secret/set",
			[
				`=numbers=${account.wsnId}`,
				`=disabled=yes`,
			]
		);
	}

	// ==================================================
	// Enable User (Resume)
	// ==================================================
	async resumeUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ppp/secret/set",
			[
				`=numbers=${account.wsnId}`,
				`=disabled=no`,
			]
		);
	}

	// ==================================================
	// Disconnect Active Session
	// ==================================================
	async disconnectUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ppp/active/remove",
			[
				`=numbers=${account.wsnId}`,
			]
		);
	}
}