export class Usage {

	constructor({
		id,
		accountId,
		subscriptionId = null,
		routerId,
		username,
		sessionId,
		type,
		ipAddress,
		macAddress = null,
		interfaceName = null,

		bytesIn = 0,
		bytesOut = 0,

		lastBytesIn = 0,
		lastBytesOut = 0,

		sessionTime = 0,

		startedAt,
		endedAt = null
	}) {

		if (!accountId) throw new Error("accountId required");
		if (!routerId) throw new Error("routerId required");
		if (!username) throw new Error("username required");
		if (!sessionId) throw new Error("sessionId required");
		if (!ipAddress) throw new Error("ipAddress required");
		if (!startedAt) throw new Error("startedAt required");
		if (!type) throw new Error("type required");

		Object.defineProperty(this, "id", { value: id, writable: false });

		this.accountId = accountId;
		this.subscriptionId = subscriptionId;

		this.routerId = routerId;
		this.username = username;

		this.sessionId = sessionId;
		this.type = type;

		this.ipAddress = ipAddress;
		this.macAddress = macAddress
			? macAddress.toLowerCase().replace(/-/g, ":")
			: null;

		this.interfaceName = interfaceName;

		this.bytesIn = bytesIn;
		this.bytesOut = bytesOut;

		this.lastBytesIn = lastBytesIn;
		this.lastBytesOut = lastBytesOut;

		this.sessionTime = sessionTime;

		this.startedAt = new Date(startedAt);
		this.endedAt = endedAt ? new Date(endedAt) : null;
	}

	updateUsageFromRouter({ bytesIn, bytesOut, sessionTime }) {

		if (bytesIn < this.lastBytesIn || bytesOut < this.lastBytesOut)
			throw new Error("Router counters cannot decrease");

		const deltaIn = bytesIn - this.lastBytesIn;
		const deltaOut = bytesOut - this.lastBytesOut;

		this.bytesIn += deltaIn;
		this.bytesOut += deltaOut;

		this.lastBytesIn = bytesIn;
		this.lastBytesOut = bytesOut;

		if (sessionTime !== undefined)
			this.sessionTime = sessionTime;

		return {
			deltaIn,
			deltaOut
		};
	}

	markDisconnected(time = new Date()) {

		if (time < this.startedAt)
			throw new Error("Invalid disconnect time");

		this.endedAt = new Date(time);
	}

	isActive() {
		return !this.endedAt;
	}

	getStatus() {
		return this.isActive() ? "active" : "offline";
	}

	getTotalData() {
		return this.bytesIn + this.bytesOut;
	}

	getDuration() {

		if (this.endedAt)
			return (this.endedAt - this.startedAt) / 1000;

		return Math.floor(
			(Date.now() - this.startedAt.getTime()) / 1000
		);
	}
}