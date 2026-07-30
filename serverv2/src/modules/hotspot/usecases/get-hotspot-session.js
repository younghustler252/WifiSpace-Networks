export class GetHotspotSession {
	constructor({ resolveHotspotSession }) {
		this.resolveHotspotSession = resolveHotspotSession;
	}

	async execute({ macAddress }) {
		if (!macAddress) {
			return this._emptyResponse();
		}

		const resolved = await this.resolveHotspotSession.execute({ macAddress });

		if (!resolved) {
			return this._emptyResponse();
		}

		const { session, user, account, subscription, plan } = resolved;

		const isTrusted = !!session?.trustedDevice && session.status === "authenticated";

		return {
			user,
			account,
			subscription,
			plan: plan ?? subscription?.planSnapshot ?? null,

			// Matches HotspotIdentity in hotspot.types.ts
			identity: session ? {
				id: session.id,
				macAddress: session.macAddress,
				status: session.status,
				trusted: session.trustedDevice,
				lastSeenAt: session.lastSeenAt
			} : null,

			hasUser: true,
			hasHotspotAccount: true,
			hasActiveSubscription: subscription?.status === "active",

			trustedDevice: isTrusted,
			requiresLogin: !isTrusted,
			needsIdentity: false,

			// CHANGED: was account.profileStatus, which no longer exists on
			// Account — subscription.status is the single source of truth for
			// lifecycle state now.
			accountStatus: subscription?.status ?? null
		};
	}

	_emptyResponse() {
		return {
			user: null,
			account: null,
			subscription: null,
			plan: null,
			identity: null,

			hasUser: false,
			hasHotspotAccount: false,
			hasActiveSubscription: false,

			trustedDevice: false,
			requiresLogin: true,
			needsIdentity: true,

			accountStatus: null
		};
	}
}