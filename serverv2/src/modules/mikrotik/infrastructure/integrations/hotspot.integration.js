import { mikrotikClient } from "../client/mikrotik.client.js";

export class HotspotIntegration {
	constructor(router) {
		this.router = router;
	}

	// ==================================================
	// Create Hotspot User (after payment or voucher)
	// ==================================================
	async createUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ip/hotspot/user/add",
			[
				`=name=${account.wsnId}`,
				`=password=${account.pppoePassword || account.wsnId}`,
				`=profile=${account.routerProfile || "default"}`,
			]
		);
	}

	// ==================================================
	// Disable Hotspot User (suspend subscription)
	// ==================================================
	async suspendUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ip/hotspot/user/set",
			[
				`=numbers=${account.wsnId}`,
				`=disabled=yes`,
			]
		);
	}

	// ==================================================
	// Enable Hotspot User
	// ==================================================
	async resumeUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ip/hotspot/user/set",
			[
				`=numbers=${account.wsnId}`,
				`=disabled=no`,
			]
		);
	}

	// ==================================================
	// Kick Active Session (force logout)
	// ==================================================
	async disconnectUser(account) {
		return mikrotikClient.execute(
			this.router,
			"/ip/hotspot/active/remove",
			[
				`=numbers=${account.wsnId}`,
			]
		);
	}
}