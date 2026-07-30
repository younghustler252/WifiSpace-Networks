export class HotspotSession {

	constructor({
		userId,
		accountId,
		macAddress,
		ipAddress,
		routerId,
		status = "active",
		trustedDevice = false,
		lastSeenAt = new Date(),
		expiresAt
	}) {

		this.userId = userId;
		this.accountId = accountId;

		this.macAddress = macAddress;
		this.ipAddress = ipAddress;

		this.routerId = routerId;

		this.status = status;

		this.trustedDevice = trustedDevice;

		this.lastSeenAt = lastSeenAt;

		this.expiresAt = expiresAt;
	}


	isExpired() {
		return this.expiresAt &&
			new Date() > this.expiresAt;
	}


	refresh() {
		this.lastSeenAt = new Date();
	}

	authenticate({ userId, accountId, routerId, ipAddress, userAgent }) {
		this.userId = userId;
		this.accountId = accountId;
		this.routerId = routerId;
		this.ipAddress = ipAddress;
		this.userAgent = userAgent;
		this.status = "authenticated";
		this.trustedDevice = true;
		this.lastSeenAt = new Date();
	}

	refresh() {
		this.lastSeenAt = new Date();
	}

	revoke() {
		this.status = "revoked";
	}
}