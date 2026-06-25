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
		console.log("metadata",metadata)

		const macAddress = metadata.macAddress || null;
		const ipAddress = metadata.ipAddress;
		const routerId = metadata.routerId;

		return await this.activateHotspotAccess.execute({
			accountId: account.id,
			macAddress: metadata.macAddress,
			routerId: metadata.routerId,
			ipAddress: ipAddress,
			routerProfile: plan.mikrotikProfile,
			hostname: metadata.hostname || ""
		});
	}
}