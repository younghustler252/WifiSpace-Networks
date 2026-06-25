export class HotspotActivatior {

	constructor({
		activateHotspotAccess
	}) {
		this.activateHotspotAccess = activateHotspotAccess;
	}

	async activate({
		account,
		plan,
		metadata
	}) {

		if (!metadata.macAddress) {
			throw new Error("MAC address required for hotspot");
		}

		if (!metadata.routerId) {
			throw new Error("Router ID required");
		}

		return await this.activateHotspotAccess.execute({
			accountId: account.id,
			macAddress: metadata.macAddress,
			routerId: metadata.routerId,
			routerProfile: plan.mikrotikProfile
		});
	}
}