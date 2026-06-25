export class PppoeActivatior {

	constructor({
		activatePppoeAccess
	}) {
		this.activatePppoeAccess = activatePppoeAccess;
	}

	async activate({
		account,
		metadata
	}) {

		if (!metadata.username || !metadata.password) {
			throw new Error("PPPoE credentials required");
		}

		if (!metadata.routerId) {
			throw new Error("Router ID required");
		}

		return await this.activatePppoeAccess.execute({
			accountId: account.id,
			username: metadata.username,
			password: metadata.password,
			routerId: metadata.routerId
		});
	}
}