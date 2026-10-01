import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class ConfirmHotspot {
	constructor({ hotspotSessionRepository, accountRepository, networkService }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.accountRepository = accountRepository;
		this.networkService = networkService;
	}

	// Called by ProcessSuccessfulPayment right after subscription.activate(), only
	// when the account's serviceType is hotspot. metadata carries what was
	// captured at HotspotCheckoutFlow time (macAddress, routerId, ipAddress).
	async execute({ subscription, metadata }) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account || account.serviceType !== SERVICE_TYPES.HOTSPOT) return null;
		if (!metadata?.macAddress || !metadata?.routerId) return null;

		const session = await this.hotspotSessionRepository.upsertByMac(metadata.macAddress, {
			macAddress: metadata.macAddress, routerId: metadata.routerId,
			userId: subscription.userId, accountId: account.id,
			ipAddress: metadata.ipAddress, status: "authenticated", trustedDevice: true, lastSeenAt: new Date()
		});

		const provisionResult = await this.networkService.activate(subscription, { routerId: metadata.routerId, ipAddress: metadata.ipAddress });

		return { session, provisionResult };
	}
}