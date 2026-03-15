export class Subscription {
	constructor({
		id,
		accountId,
		planId,
		startDate,
		endDate,
		status = "active",
		autoRenew = false,
		routerProfile = null,
		paymentId = null,
		suspensionReason = null
	}) {
		this.id = id;
		this.accountId = accountId;
		this.planId = planId;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.autoRenew = autoRenew;
		this.routerProfile = routerProfile;
		this.paymentId = paymentId;
		this.suspensionReason = suspensionReason;
	}

	// -----------------------------
	// Check status
	// -----------------------------
	isActive() {
		return this.status === "active" && new Date() <= this.endDate;
	}

	isExpired() {
		return new Date() > this.endDate;
	}

	// -----------------------------
	// Change status
	// -----------------------------
	suspend(reason) {
		this.status = "suspended";
		this.suspensionReason = reason;
	}

	cancel() {
		this.status = "canceled";
	}

	expire() {
		this.status = "expired";
	}

	renew(newEndDate) {
		this.startDate = new Date();
		this.endDate = newEndDate;
		this.status = "active";
	}
}