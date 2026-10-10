import { SUBSCRIPTION_STATUSES, SUBSCRIPTION_STATUS_LIST, RENEWAL_STRATEGIES, MIKROTIK_SYNC_STATUSES } from "./subscription.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Subscription {
	constructor({
		id, accountId, userId, planId,
		status = SUBSCRIPTION_STATUSES.PENDING,
		planSnapshot,
		pendingPlanId = null, pendingPlanSnapshot = null,
		cycles = 1, totalAmount,
		startsAt = null, expiresAt = null, graceEndsAt = null, activatedAt = null, expiredAt = null,
		currentPeriodStart = null, currentPeriodEnd = null,
		renewalStrategy = RENEWAL_STRATEGIES.MANUAL, autoRenewEnabled = false, nextRenewalDate = null, lastRenewedAt = null,
		lastPaymentId = null, lastPaymentDate = null, lastPaymentAmount = null,
		suspendedAt = null, totalSuspendedDuration = 0, suspensionReason = null,
		canceledAt = null, cancellationReason = null,
		bonusDays = 0, manualAdjustmentDays = 0,
		mikrotikStatus = MIKROTIK_SYNC_STATUSES.PENDING, mikrotikLastSyncAt = null, mikrotikError = null,
		remindersSent = [], events = [],
		createdAt = null, updatedAt = null
	}) {
		if (!accountId) throw new ValidationError("Account ID is required");
		if (!userId) throw new ValidationError("User ID is required");
		if (!planId) throw new ValidationError("Plan ID is required");
		if (!planSnapshot) throw new ValidationError("Plan snapshot is required");
		if (!SUBSCRIPTION_STATUS_LIST.includes(status)) throw new ValidationError("Invalid subscription status");
		if (totalAmount == null || totalAmount < 0) throw new ValidationError("Invalid total amount");
		if (cycles < 1) throw new ValidationError("Cycles must be at least 1");

		Object.assign(this, {
			id, accountId, userId, planId, status, planSnapshot,
			pendingPlanId, pendingPlanSnapshot,
			cycles, totalAmount,
			startsAt, expiresAt, graceEndsAt, activatedAt, expiredAt, currentPeriodStart, currentPeriodEnd,
			renewalStrategy, autoRenewEnabled, nextRenewalDate, lastRenewedAt,
			lastPaymentId, lastPaymentDate, lastPaymentAmount,
			suspendedAt, totalSuspendedDuration, suspensionReason,
			canceledAt, cancellationReason, bonusDays, manualAdjustmentDays,
			mikrotikStatus, mikrotikLastSyncAt, mikrotikError,
			remindersSent, events, createdAt, updatedAt
		});
	}

	_recordEvent(type, metadata = {}) {
		this.events.push({ type, date: new Date(), metadata });
	}

	_durationMsFor(snapshot = this.planSnapshot) {
		const { durationValue, durationUnit } = snapshot;
		const unitMs = {
			minutes: 60000,
			hours: 3600000,
			days: 86400000,
			months: 30 * 86400000
		}[durationUnit];

		return durationValue * unitMs;
	}

	_graceEndFor(expiresAt) {
		const days = this.planSnapshot?.gracePeriodDays;
		return days ? new Date(expiresAt.getTime() + days * 86400000) : null;
	}

	_applyPayment({ paymentId, paymentAmount, paymentDate }) {
		if (!paymentId) return;

		this.lastPaymentId = paymentId;
		this.lastPaymentDate = paymentDate ?? new Date();
		this.lastPaymentAmount = paymentAmount;
	}

	activate({ paymentId = null, paymentAmount = null, paymentDate = new Date() } = {}) {
		const now = new Date();
		const bonusMs = (this.bonusDays + this.manualAdjustmentDays) * 86400000;

		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.startsAt = this.startsAt || now;
		this.activatedAt = now;
		this.currentPeriodStart = now;

		// IMPORTANT:
		// cycles are applied here so a 2-cycle subscription gets 2 x plan duration.
		this.expiresAt = new Date(
			now.getTime() + this._durationMsFor() * this.cycles + bonusMs
		);

		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this._graceEndFor(this.expiresAt);

		this._applyPayment({
			paymentId,
			paymentAmount,
			paymentDate
		});

		this._recordEvent("activated", {
			cycles: this.cycles,
			bonusDays: this.bonusDays
		});
	}

	renew({
		cycles = 1,
		bonusDays = 0,
		paymentId = null,
		paymentAmount = null,
		paymentDate = new Date()
	} = {}) {
		const now = new Date();

		const stillRunning =
			this.status === SUBSCRIPTION_STATUSES.ACTIVE &&
			this.expiresAt &&
			new Date(this.expiresAt) > now;

		const base = stillRunning
			? new Date(this.expiresAt)
			: now;

		this.bonusDays = bonusDays;
		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.expiredAt = null;
		this.suspendedAt = null;
		this.suspensionReason = null;
		this.currentPeriodStart = base;

		this.expiresAt = new Date(
			base.getTime() +
			this._durationMsFor() * cycles +
			bonusDays * 86400000
		);

		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this._graceEndFor(this.expiresAt);
		this.lastRenewedAt = now;

		this.cycles += cycles;

		this.totalAmount +=
			paymentAmount ?? this.planSnapshot.price * cycles;

		this._applyPayment({
			paymentId,
			paymentAmount,
			paymentDate
		});

		this._recordEvent("renewed", {
			cycles: this.cycles,
			addedCycles: cycles,
			bonusDays
		});
	}

	schedulePlanChange(planId, planSnapshot) {
		this.pendingPlanId = planId;
		this.pendingPlanSnapshot = planSnapshot;
		this._recordEvent("manual_adjustment", {
			type: "downgrade_scheduled",
			to: planSnapshot.name
		});
	}

	applyPendingPlanChange() {
		if (!this.pendingPlanId) return false;

		this.planId = this.pendingPlanId;
		this.planSnapshot = this.pendingPlanSnapshot;
		this.pendingPlanId = null;
		this.pendingPlanSnapshot = null;

		return true;
	}

	upgradeNow(
		planId,
		planSnapshot,
		{
			cycles = 1,
			paymentId = null,
			paymentAmount = null,
			paymentDate = new Date()
		} = {}
	) {
		const now = new Date();

		const remainingMs = this.isActive()
			? Math.max(
				0,
				new Date(this.expiresAt).getTime() - now.getTime()
			)
			: 0;

		this.planId = planId;
		this.planSnapshot = planSnapshot;
		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.activatedAt = now;
		this.currentPeriodStart = now;

		this.expiresAt = new Date(
			now.getTime() +
			this._durationMsFor(planSnapshot) * cycles +
			remainingMs
		);

		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this._graceEndFor(this.expiresAt);

		this.cycles += cycles;
		this.totalAmount += paymentAmount ?? 0;

		this._applyPayment({
			paymentId,
			paymentAmount,
			paymentDate
		});

		this._recordEvent("manual_adjustment", {
			type: "upgrade",
			carriedOverMs: remainingMs
		});
	}
	recordEvent(type, metadata = {}) {
		this._recordEvent(type, metadata);
	}
	extend(days, reason = null) {
		const now = new Date();
		const previousExpiresAt = this.expiresAt;

		const stillRunning =
			this.status === SUBSCRIPTION_STATUSES.ACTIVE &&
			this.expiresAt &&
			new Date(this.expiresAt) > now;

		const anchor =
			days < 0 || stillRunning
				? new Date(this.expiresAt ?? now)
				: now;

		this.expiresAt = new Date(
			anchor.getTime() + days * 86400000
		);

		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this._graceEndFor(this.expiresAt);
		this.manualAdjustmentDays += days;

		const reactivated =
			this.status === SUBSCRIPTION_STATUSES.EXPIRED &&
			this.expiresAt > now;

		if (reactivated) {
			this.status = SUBSCRIPTION_STATUSES.ACTIVE;
			this.expiredAt = null;
		}

		this._recordEvent("manual_adjustment", {
			type: "extend",
			days,
			reason,
			previousExpiresAt
		});

		return reactivated;
	}

	suspend(reason = null) {
		this.status = SUBSCRIPTION_STATUSES.SUSPENDED;
		this.suspendedAt = new Date();
		this.suspensionReason = reason;
		this._recordEvent("suspended", { reason });
	}

	resume() {
		if (this.suspendedAt) {
			this.totalSuspendedDuration +=
				Date.now() - new Date(this.suspendedAt).getTime();
		}

		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.suspendedAt = null;
		this.suspensionReason = null;

		this._recordEvent("resumed");
	}

	expire() {
		const now = new Date();

		this._recordEvent("expired", {
			previousExpiresAt: this.expiresAt
		});

		this.status = SUBSCRIPTION_STATUSES.EXPIRED;
		this.expiredAt = now;

		if (
			!this.expiresAt ||
			new Date(this.expiresAt) > now
		) {
			this.expiresAt = now;
			this.graceEndsAt = null;
		}

		this.currentPeriodEnd = this.expiresAt;
	}

	cancel(reason = null) {
		const now = new Date();

		this._recordEvent("canceled", {
			reason,
			previousExpiresAt: this.expiresAt
		});

		this.status = SUBSCRIPTION_STATUSES.CANCELED;
		this.canceledAt = now;
		this.cancellationReason = reason;
		this.autoRenewEnabled = false;

		if (
			!this.expiresAt ||
			new Date(this.expiresAt) > now
		) {
			this.expiresAt = now;
			this.graceEndsAt = null;
		}

		this.currentPeriodEnd = this.expiresAt;
	}

	markMikrotikSynced() {
		this.mikrotikStatus = MIKROTIK_SYNC_STATUSES.SYNCED;
		this.mikrotikLastSyncAt = new Date();
		this.mikrotikError = null;
	}

	markMikrotikFailed(error) {
		this.mikrotikStatus = MIKROTIK_SYNC_STATUSES.FAILED;
		this.mikrotikError = error;
	}

	isActive() {
		return this.status === SUBSCRIPTION_STATUSES.ACTIVE &&
			this.expiresAt &&
			new Date() < new Date(this.expiresAt);
	}

	isInGracePeriod() {
		return this.status === SUBSCRIPTION_STATUSES.ACTIVE &&
			this.graceEndsAt &&
			new Date() >= new Date(this.expiresAt) &&
			new Date() < new Date(this.graceEndsAt);
	}

	isExpired() {
		return this.status === SUBSCRIPTION_STATUSES.EXPIRED ||
			(this.expiresAt &&
				new Date() >= new Date(this.graceEndsAt || this.expiresAt));
	}

	getRemainingSeconds() {
		if (!this.expiresAt) return 0;

		return Math.max(
			0,
			Math.floor(
				(new Date(this.expiresAt).getTime() - Date.now()) / 1000
			)
		);
	}

	toJSON() {
		return { ...this };
	}
}
