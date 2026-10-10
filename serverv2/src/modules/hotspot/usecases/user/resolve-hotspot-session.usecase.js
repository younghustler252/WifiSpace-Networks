export class ResolveHotspotSession {
	constructor({ hotspotSessionRepository, subscriptionRepository, routerRepository, routerProvisioningRepository, networkService }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerRepository = routerRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.networkService = networkService;
	}

	async execute({ macAddress, ipAddress = null, routerId, routerUid, identity }) {
		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, identity });
		const session = await this.hotspotSessionRepository.findByMac(macAddress);

		if (!session || session.isExpired() || session.isRevoked()) return { state: "UNKNOWN_DEVICE", router };
		if (!session.isAuthenticated()) return { state: "PENDING", router, session };

		const subscription = session.accountId ? await this.subscriptionRepository.findCurrentByAccountId(session.accountId) : null;
		if (!subscription?.isActive()) return { state: "TRUSTED_NEEDS_PLAN", router, session };
		if (!router) return { state: "ACTIVE", router, session, subscription };

		const provisioned = await this.routerProvisioningRepository.findByAccountAndRouter(session.accountId, router.id);
		const live = provisioned?.status === "synced" && subscription.mikrotikStatus === "synced";
		if (live) return { state: "ACTIVE", router, session, subscription, provisioning: "synced" };

		if (subscription.mikrotikStatus === "failed") {
			return { state: "ACTIVATION_FAILED", router, session, subscription, provisioning: "failed" };
		}

		const stuck = Date.now() - new Date(subscription.updatedAt).getTime() > 2 * 60 * 1000;
		if (subscription.mikrotikStatus === "pending" && !stuck) {
			return { state: "ACTIVATING", router, session, subscription, provisioning: "pending" };
		}

		const result = await this.networkService.activate(subscription, { routerId: router.id, ipAddress, macAddress });
		return { state: "ACTIVATING", router, session, subscription, provisioning: result.provisioning?.status ?? "pending" };
	}
}