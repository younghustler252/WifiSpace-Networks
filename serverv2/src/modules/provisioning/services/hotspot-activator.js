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

		return await this.activateHotspotAccess.execute({
			accountId: account.id,
			macAddress: metadata.macAddress,
			routerId: metadata.routerId,
			routerProfile: plan.mikrotikProfile
		});
	}
}