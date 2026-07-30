export class Subscription {
	constructor({
		id,
		accountId,
		planId,
		userId,
		planSnapshot = {},
		status = "pending",
		cycles = 1,
		totalAmount = 0,
		startsAt = null,
		expiresAt = null,
		activatedAt = null,
		expiredAt = null,
		bonusDays = 0,
		manualAdjustmentDays = 0,
		suspendedAt = null,
		totalSuspendedDuration = 0,
		suspensionReason = null,
		renewalStrategy = "manual",
		autoRenewEnabled = false,
		defaultPaymentChannel = null,
		billingAuthorization = null,
		authorizationReusable = false,
		lastRenewedAt = null,
		nextRenewalDate = null,
		canceledAt = null,
		cancellationReason = null,
		lastPaymentId = null,
		lastPaymentDate = null,
		lastPaymentAmount = null,
		graceEndsAt = null,

		remindersSent = [],
		currentPeriodStart = null,
		currentPeriodEnd = null,
		mikrotikStatus = "pending",
		mikrotikLastSyncAt = null,
		mikrotikError = null,
		events = []
	}) {
		this.id = id;
		this.accountId = accountId;
		this.planId = planId;
		this.userId = userId;

		this.planSnapshot = planSnapshot;

		this.status = status;
		this.cycles = cycles;
		this.totalAmount = totalAmount;

		this.startsAt = startsAt ? new Date(startsAt) : null;
		this.expiresAt = expiresAt ? new Date(expiresAt) : null;
		this.activatedAt = activatedAt ? new Date(activatedAt) : null;
		this.expiredAt = expiredAt ? new Date(expiredAt) : null;

		this.bonusDays = bonusDays;
		this.manualAdjustmentDays = manualAdjustmentDays;

		this.suspendedAt = suspendedAt ? new Date(suspendedAt) : null;
		this.totalSuspendedDuration = totalSuspendedDuration;
		this.suspensionReason = suspensionReason;

		this.renewalStrategy = renewalStrategy;
		this.autoRenewEnabled = autoRenewEnabled;

		this.defaultPaymentChannel = defaultPaymentChannel;
		this.billingAuthorization = billingAuthorization;
		this.authorizationReusable = authorizationReusable;

		this.lastRenewedAt = lastRenewedAt ? new Date(lastRenewedAt) : null;
		this.nextRenewalDate = nextRenewalDate ? new Date(nextRenewalDate) : null;

		this.canceledAt = canceledAt ? new Date(canceledAt) : null;
		this.cancellationReason = cancellationReason;

		this.lastPaymentId = lastPaymentId;
		this.lastPaymentDate = lastPaymentDate ? new Date(lastPaymentDate) : null;
		this.lastPaymentAmount = lastPaymentAmount;

		this.graceEndsAt = graceEndsAt ? new Date(graceEndsAt) : null;
		this.currentPeriodStart = currentPeriodStart ? new Date(currentPeriodStart) : null;
		this.currentPeriodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;

		

		this.mikrotikStatus = mikrotikStatus;
		this.mikrotikLastSyncAt = mikrotikLastSyncAt ? new Date(mikrotikLastSyncAt) : null;
		this.mikrotikError = mikrotikError;

		this.remindersSent = remindersSent;
		this.events = [...events];
		
	}

	// =========================
	// TIME / STATE SEPARATION
	// =========================

	/**
	 * PURE TIME CHECK
	 */
	isPastExpiry() {
		return this.expiresAt && new Date() > this.expiresAt;
	}

	/**
	 * STATE CHECK (SOURCE OF TRUTH)
	 */
	isExpired() {
		return this.status === "expired";
	}

	isSuspended() {
		return this.status === "suspended";
	}

	isCanceled() {
		return this.status === "canceled";
	}

	isActive() {
		return (
			this.status === "active" &&
			!this.isSuspended() &&
			!this.isExpired() &&
			(!this.expiresAt || new Date() <= this.expiresAt)
		);
	}

	isInGracePeriod() {
		if (!this.expiresAt) return false;

		const graceDays = this.planSnapshot?.gracePeriodDays || 0;

		const graceEnd = new Date(
			this.expiresAt.getTime() + graceDays * 86400000
		);

		return this.isPastExpiry() && new Date() <= graceEnd;
	}

	hasAccess() {
		return this.isActive() || this.isInGracePeriod();
	}

	// =========================
	// IDENTITY / IDENTITY SAFETY
	// =========================

	/**
	 * SAFE GUARD:
	 * prevents double processing in workers/cron
	 */
	isAlreadyFinalized() {
		return this.status === "expired" || this.status === "canceled";
	}

	// =========================
	// LIFECYCLE METHODS
	// =========================

	activate() {
		this.status = "active";

		if (!this.activatedAt) {
			this.activatedAt = new Date();
		}

		this.addEvent("activated");
	}

	suspend(reason) {
		if (this.isSuspended()) return;

		this.status = "suspended";
		this.suspendedAt = new Date();
		this.suspensionReason = reason;

		this.addEvent("suspended", { reason });
	}

	resume() {
		if (!this.suspendedAt) return;

		const duration = Date.now() - this.suspendedAt.getTime();

		this.totalSuspendedDuration += duration;

		this.suspendedAt = null;
		this.suspensionReason = null;

		if (this.expiresAt && !this.isExpired()) {
			this.expiresAt = new Date(this.expiresAt.getTime() + duration);
		}

		this.status = "active";

		this.addEvent("resumed", { duration });
	}

	cancel(reason) {
		if (this.isCanceled()) return;

		this.status = "canceled";
		this.canceledAt = new Date();
		this.cancellationReason = reason;

		this.addEvent("canceled", { reason });
	}

	/**
	 * IDEMPOTENT EXPIRY
	 */
	expire() {
		if (this.isExpired()) return; // 👈 IMPORTANT GUARD

		this.status = "expired";
		this.expiredAt = new Date();

		this.addEvent("expired");
	}

	renew({
		newExpiresAt,
		paymentId = null,
		amount = 0,
		cycles = 1,
		metadata = {}
	}) {
		const now = new Date();

		if (!this.startsAt) {
			this.startsAt = now;
		}

		this.expiresAt = new Date(newExpiresAt);

		this.status = "active";
		this.expiredAt = null;

		this.canceledAt = null;
		this.cancellationReason = null;

		this.lastRenewedAt = now;
		this.cycles += cycles;

		this.lastPaymentId = paymentId;
		this.lastPaymentDate = now;
		this.lastPaymentAmount = amount;

		this.addEvent("renewed", {
			newExpiresAt,
			amount,
			cycles,
			...metadata
		});
	}

	// =========================
	// MIKROTIK SYNC
	// =========================

	upgrade({
		newPlan,
		newExpiresAt,
		paymentId,
		remainingDays
	}) {
		const previousPlan = this.planSnapshot?.name;

		this.planId = newPlan.id;

		this.planSnapshot = {
			name: newPlan.name,
			serviceType: newPlan.serviceType,
			price: newPlan.price,
			durationValue: newPlan.durationValue,
			durationUnit: newPlan.durationUnit,
			speedRate: newPlan.speedRate,
			mikrotikProfile: newPlan.mikrotikProfile,
			devicesAllowed: newPlan.devicesAllowed,
			gracePeriodDays: newPlan.gracePeriodDays
		};

		this.expiresAt = new Date(newExpiresAt);

		this.status = "active";
		this.expiredAt = null;

		this.lastRenewedAt = new Date();

		if (paymentId) {
			this.lastPaymentId = paymentId;
		}

		this.addEvent("upgraded", {
			from: previousPlan,
			to: newPlan.name,
			remainingDays,
			newExpiresAt
		});
	}

	markSynced() {
		this.mikrotikStatus = "synced";
		this.mikrotikLastSyncAt = new Date();
		this.mikrotikError = null;
	}

	markSyncFailed(error) {
		this.mikrotikStatus = "failed";
		this.mikrotikError = error;
		this.mikrotikLastSyncAt = new Date();
	}

	// =========================
	// EVENTS
	// =========================

	addEvent(type, metadata = {}) {
		this.events.push({
			type,
			date: new Date(),
			metadata
		});
	}
}