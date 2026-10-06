// hotspot/usecases/admin/get-account-locations.usecase.js — "which locations, over time"
export class GetAccountLocations {
	constructor({ routerProvisioningRepository }) { this.routerProvisioningRepository = routerProvisioningRepository; }
	async execute({ accountId }) {
		return this.routerProvisioningRepository.findByAccount(accountId);
	}
}