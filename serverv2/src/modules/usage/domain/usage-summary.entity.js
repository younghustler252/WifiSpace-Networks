export class UsageSummary {

	constructor({
		id,
		accountId = null,
		subscriptionId = null,
		routerId = null,
		periodType,
		period,
		totalBytesIn = 0,
		totalBytesOut = 0,
		totalSessionTime = 0,
		sessionCount = 0,
		lastUpdatedAt = new Date()
	}) {

		if (!periodType) throw new Error("periodType required");
		if (!period) throw new Error("period required");

		Object.defineProperty(this, "id", { value: id, writable: false });

		this.accountId = accountId;
		this.subscriptionId = subscriptionId;
		this.routerId = routerId;

		this.periodType = periodType;
		this.period = period;

		this.totalBytesIn = totalBytesIn;
		this.totalBytesOut = totalBytesOut;
		this.totalSessionTime = totalSessionTime;

		this.sessionCount = sessionCount;

		this.lastUpdatedAt = lastUpdatedAt;
	}

	addUsage({ bytesIn = 0, bytesOut = 0, sessionTime = 0 }) {

		this.totalBytesIn += bytesIn;
		this.totalBytesOut += bytesOut;
		this.totalSessionTime += sessionTime;

		this.lastUpdatedAt = new Date();
	}

	recordSessionStart() {
		this.sessionCount += 1;
	}

	getTotalData() {
		return this.totalBytesIn + this.totalBytesOut;
	}
}