export class Subscription {
	constructor({
		id,
		accountId,
		planId,

		planSnapshot,

		startDate,
		baseEndDate,
		endDate,

		status = "active",

		billingCycle = "monthly",
		cycles = 1,
		totalAmount = 0,

		bonusDays = 0,
		manualAdjustmentDays = 0,

		suspendedAt = null,
		totalSuspendedDuration = 0,
		suspensionReason = null,

		autoRenew = false,
		lastRenewedAt = null,
		nextRenewalDate = null,

		canceledAt = null,
		cancellationReason = null,

		gracePeriodDays = 0,

		payments = [],
		events = [],

		routerProfile = null
	}) {
		this.id = id;
		this.accountId = accountId;
		this.planId = planId;

		this.planSnapshot = planSnapshot;

		this.startDate = new Date(startDate);
		this.baseEndDate = new Date(baseEndDate);
		this.endDate = new Date(endDate);

		this.status = status;

		this.billingCycle = billingCycle;
		this.cycles = cycles;
		this.totalAmount = totalAmount;

		this.bonusDays = bonusDays;
		this.manualAdjustmentDays = manualAdjustmentDays;

		this.suspendedAt = suspendedAt ? new Date(suspendedAt) : null;
		this.totalSuspendedDuration = totalSuspendedDuration;
		this.suspensionReason = suspensionReason;

		this.autoRenew = autoRenew;
		this.lastRenewedAt = lastRenewedAt ? new Date(lastRenewedAt) : null;
		this.nextRenewalDate = nextRenewalDate ? new Date(nextRenewalDate) : null;

		this.canceledAt = canceledAt ? new Date(canceledAt) : null;
		this.cancellationReason = cancellationReason;

		this.gracePeriodDays = gracePeriodDays;

		this.payments = payments;
		this.events = events;

		this.routerProfile = routerProfile;
	}

	// -----------------------------
	// Status checks
	// -----------------------------
	isActive() {
		return (
			this.status === "active" &&
			!this.suspendedAt &&
			new Date() <= this.getEffectiveEndDate()
		);
	}

	isExpired() {
		return new Date() > this.getEffectiveEndDate();
	}

	isSuspended() {
		return this.status === "suspended";
	}

	isInGracePeriod() {
		const now = new Date();
		const graceEnd = new Date(
			this.endDate.getTime() +
			this.gracePeriodDays * 24 * 60 * 60 * 1000
		);

		return now > this.endDate && now <= graceEnd;
	}

	// -----------------------------
	// Core logic
	// -----------------------------
	getEffectiveEndDate() {
		return this.endDate;
	}

	// -----------------------------
	// Lifecycle actions
	// -----------------------------
	suspend(reason) {
		if (this.isSuspended()) return;

		this.status = "suspended";
		this.suspensionReason = reason;
		this.suspendedAt = new Date();

		this.addEvent("suspended", { reason });
	}

	resume() {
		if (!this.suspendedAt) return;

		const now = new Date();
		const duration = now - this.suspendedAt;

		this.totalSuspendedDuration += duration;

		// extend fairly
		this.endDate = new Date(this.endDate.getTime() + duration);

		this.suspendedAt = null;
		this.status = "active";
		this.suspensionReason = null;

		this.addEvent("resumed", { duration });
	}

	cancel(reason) {
		this.status = "canceled";
		this.canceledAt = new Date();
		this.cancellationReason = reason;

		this.addEvent("canceled", { reason });
	}

	expire() {
		this.status = "expired";
		this.addEvent("expired");
	}

	renew({ newEndDate, amountPaid }) {
		const now = new Date();

		// stack renewal properly
		this.startDate =
			this.endDate > now ? this.endDate : now;

		this.baseEndDate = new Date(newEndDate);
		this.endDate = new Date(newEndDate);

		this.status = "active";
		this.lastRenewedAt = now;

		this.cycles += 1;
		this.totalAmount += amountPaid;

		this.addEvent("renewed", {
			newEndDate,
			amountPaid
		});
	}

	// -----------------------------
	// Adjustments
	// -----------------------------
	addManualDays(days) {
		if (days <= 0) return;

		this.manualAdjustmentDays += days;

		const ms = days * 24 * 60 * 60 * 1000;

		this.endDate = new Date(this.endDate.getTime() + ms);

		this.addEvent("manual_adjustment", { days });
	}

	addBonusDays(days) {
		if (days <= 0) return;

		this.bonusDays += days;

		const ms = days * 24 * 60 * 60 * 1000;

		this.endDate = new Date(this.endDate.getTime() + ms);

		this.addEvent("manual_adjustment", {
			type: "bonus",
			days
		});
	}

	// -----------------------------
	// Payments
	// -----------------------------
	addPayment({ paymentId, amount }) {
		this.payments.push({
			paymentId,
			amount,
			date: new Date()
		});
	}

	// -----------------------------
	// Events (audit trail)
	// -----------------------------
	addEvent(type, metadata = {}) {
		this.events.push({
			type,
			date: new Date(),
			metadata
		});
	}
}