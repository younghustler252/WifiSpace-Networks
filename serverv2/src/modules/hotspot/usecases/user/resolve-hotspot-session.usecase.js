export class ResolveHotspotSession {
	constructor({ hotspotSessionRepository, subscriptionRepository, routerRepository, routerProvisioningRepository, networkService, userRepository }) {
		this.userRepository = userRepository;
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerRepository = routerRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.networkService = networkService;
	}

	async execute({ macAddress, ipAddress = null, routerId, routerUid, routerCode, identity }) {
		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, routerCode, identity });
		const session = await this.hotspotSessionRepository.findByMac(macAddress);

		if (!session || session.isExpired() || session.isRevoked()) return { state: "UNKNOWN_DEVICE", router };
		if (!session.isAuthenticated()) return { state: "PENDING", router, session };

		const subscription = session.accountId ? await this.subscriptionRepository.findCurrentByAccountId(session.accountId) : null;
		if (!subscription?.isActive()) {
			const owner = session.userId ? await this.userRepository.findById(session.userId) : null;
			return { state: "TRUSTED_NEEDS_PLAN", router, session, user: owner ? { email: owner.email, firstName: owner.firstName } : null };
		}
		if (!router) return { state: "ACTIVE", router, session, subscription };

		const provisioned = await this.routerProvisioningRepository.findByAccountAndRouter(session.accountId, router.id);
		const live = provisioned?.status === "synced" && subscription.mikrotikStatus === "synced";
		if (live) return { state: "ACTIVE", router, session, subscription, provisioning: "synced" };

		if (subscription.mikrotikStatus === "failed") {
			const retryable = Date.now() - new Date(subscription.updatedAt).getTime() > 30 * 1000;
			if (!retryable) return { state: "ACTIVATION_FAILED", router, session, subscription, provisioning: "failed" };

			const retry = await this.networkService.activate(subscription, { routerId: router.id, ipAddress, macAddress });
			return { state: "ACTIVATING", router, session, subscription, provisioning: retry.provisioning?.status ?? "pending", retried: true };
		}

		const stuck = Date.now() - new Date(subscription.updatedAt).getTime() > 2 * 60 * 1000;
		if (subscription.mikrotikStatus === "pending" && !stuck) {
			return { state: "ACTIVATING", router, session, subscription, provisioning: "pending" };
		}

		const result = await this.networkService.activate(subscription, { routerId: router.id, ipAddress, macAddress });
		return { state: "ACTIVATING", router, session, subscription, provisioning: result.provisioning?.status ?? "pending" };
	}
}