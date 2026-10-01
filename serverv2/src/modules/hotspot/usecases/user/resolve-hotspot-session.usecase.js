export class ResolveHotspotSession {
	constructor({ hotspotSessionRepository, subscriptionRepository, routerRepository }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerRepository = routerRepository;
	}

	async execute({ macAddress, routerId, routerUid, identity }) {
		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, identity });
		const session = await this.hotspotSessionRepository.findByMac(macAddress);

		if (!session || session.isExpired() || session.isRevoked()) {
			return { state: "UNKNOWN_DEVICE", router };
		}

		if (!session.isAuthenticated()) {
			return { state: "PENDING", router, session };
		}

		const subscription = session.accountId
			? await this.subscriptionRepository.findCurrentByAccountId(session.accountId)
			: null;

		if (subscription?.isActive()) {
			return { state: "ACTIVE", router, session, subscription };
		}

		return { state: "TRUSTED_NEEDS_PLAN", router, session };
	}
}