// modules/provisioning/usecases/provision-subscription.usecase.js
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class ProvisionSubscription {
	constructor({ subscriptionRepository, networkExecutor, hotspotSessionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkExecutor = networkExecutor;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ subscriptionId, action, metadata = {} }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) return { skipped: "subscription_not_found" };

		if (["activate", "resume"].includes(action) && !subscription.isActive()) {
			return { skipped: `subscription_${subscription.status}` };
		}

		const handler = this.networkExecutor[action];
		if (!handler) throw new Error(`Unknown provisioning action: ${action}`);

		const result = await handler.call(this.networkExecutor, subscription, metadata);
		if (!result.success) throw new Error(result.error || "Provisioning failed");

		if (action === "activate" && metadata.macAddress && metadata.routerId) {
			await this.hotspotSessionRepository.upsertByMac(metadata.macAddress, {
				macAddress: metadata.macAddress, routerId: metadata.routerId,
				userId: subscription.userId, accountId: subscription.accountId,
				ipAddress: metadata.ipAddress, status: "authenticated", trustedDevice: true,
				lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS)
			});
		}

		return result;
	}
}