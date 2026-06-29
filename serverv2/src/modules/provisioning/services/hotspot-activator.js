import { toSeconds } from "../../../shared/utils/formatUptime.js";

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
		console.log("metadata", metadata)

		const ipAddress = metadata.ipAddress;
		
		// 🟩 Calculate the total time in seconds using your helper utility
		const durationValue = Number(plan.durationValue) || 0;
		const durationUnit = plan.durationUnit || "days";
		const limitUptimeSeconds = toSeconds(durationValue, durationUnit);

		return await this.activateHotspotAccess.execute({
			accountId: account.id,
			macAddress: metadata.macAddress,
			routerId: metadata.routerId,
			ipAddress: ipAddress,
			routerProfile: plan.mikrotikProfile,
			hostname: metadata.hostname || "",
			// 🟩 Pass the numeric seconds directly to ActivateHotspotAccess
			limitUptime: limitUptimeSeconds
		});
	}
}
