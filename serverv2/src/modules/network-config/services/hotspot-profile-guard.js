import { ValidationError } from "../../../shared/errors/domain.errors.js";
import { NETWORK_CONFIG_ERROR_CODES } from "../domain/network-config.enum.js";

export class HotspotProfileGuard {
	constructor({ networkConfigRepository }) {
		this.networkConfigRepository = networkConfigRepository;
	}

	async assertPlanProfile(plan) {
		const names = await this.networkConfigRepository.activeProfileNames();
		if (!names.length) return;

		const profile = plan.serviceType === "pppoe" ? plan.ipoeProfile : plan.serviceType === "hotspot" ? plan.mikrotikProfile : null;
		if (!profile || profile === "default" || names.includes(profile)) return;

		throw new ValidationError(
			`Unknown hotspot profile "${profile}". Pick one from the managed profile list or create it first.`,
			NETWORK_CONFIG_ERROR_CODES.PROFILE_UNKNOWN
		);
	}
}
