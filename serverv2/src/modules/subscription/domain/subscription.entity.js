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
		const unitMs = { minutes: 60000, hours: 3600000, days: 86400000, months: 30 * 86400000 }[durationUnit];
		return durationValue * unitMs;
	}


	activate({ paymentId = null, paymentAmount = null, paymentDate = new Date() } = {}) {
		const now = new Date();
		const bonusMs = (this.bonusDays + this.manualAdjustmentDays) * 86400000;

		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.startsAt = this.startsAt || now;
		this.activatedAt = now;
		this.currentPeriodStart = now;
		this.expiresAt = new Date(now.getTime() + this._durationMsFor() + bonusMs);
		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this.planSnapshot.gracePeriodDays
			? new Date(this.expiresAt.getTime() + this.planSnapshot.gracePeriodDays * 86400000)
			: null;

		if (paymentId) {
			this.lastPaymentId = paymentId;
			this.lastPaymentDate = paymentDate;
			this.lastPaymentAmount = paymentAmount;
		}

		this._recordEvent("activated", { bonusDays: this.bonusDays });
	}

	renew({ bonusDays = 0, paymentId = null, paymentAmount = null, paymentDate = new Date() } = {}) {
		const now = new Date();
		const base = this.isExpired() ? now : new Date(this.expiresAt);
		const bonusMs = bonusDays * 86400000;

		this.bonusDays = bonusDays;
		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.currentPeriodStart = base;
		this.expiresAt = new Date(base.getTime() + this._durationMsFor() + bonusMs);
		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = this.planSnapshot.gracePeriodDays
			? new Date(this.expiresAt.getTime() + this.planSnapshot.gracePeriodDays * 86400000)
			: null;
		this.lastRenewedAt = now;
		this.cycles += 1;

		if (paymentId) {
			this.lastPaymentId = paymentId;
			this.lastPaymentDate = paymentDate;
			this.lastPaymentAmount = paymentAmount;
		}

		this._recordEvent("renewed", { cycle: this.cycles, bonusDays });
	}

	schedulePlanChange(planId, planSnapshot) {
		this.pendingPlanId = planId;
		this.pendingPlanSnapshot = planSnapshot;
		this._recordEvent("manual_adjustment", { type: "downgrade_scheduled", to: planSnapshot.name });
	}

	applyPendingPlanChange() {
		if (!this.pendingPlanId) return false;
		this.planId = this.pendingPlanId;
		this.planSnapshot = this.pendingPlanSnapshot;
		this.pendingPlanId = null;
		this.pendingPlanSnapshot = null;
		return true;
	}

	// domain/subscription.entity.js

	upgradeNow(planId, planSnapshot) {
		const now = new Date();
		const remainingMs = this.isActive() ? Math.max(0, new Date(this.expiresAt).getTime() - now.getTime()) : 0;
		const newDurationMs = this._durationMsFor(planSnapshot);

		this.planId = planId;
		this.planSnapshot = planSnapshot;
		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.activatedAt = now;
		this.currentPeriodStart = now;
		this.expiresAt = new Date(now.getTime() + newDurationMs + remainingMs);
		this.currentPeriodEnd = this.expiresAt;
		this.graceEndsAt = planSnapshot.gracePeriodDays
			? new Date(this.expiresAt.getTime() + planSnapshot.gracePeriodDays * 86400000)
			: null;

		this._recordEvent("manual_adjustment", { type: "upgrade", carriedOverMs: remainingMs });
	}

	
	
	suspend(reason = null) {
		this.status = SUBSCRIPTION_STATUSES.SUSPENDED;
		this.suspendedAt = new Date();
		this.suspensionReason = reason;
		this._recordEvent("suspended", { reason });
	}

	resume() {
		if (this.suspendedAt) this.totalSuspendedDuration += Date.now() - new Date(this.suspendedAt).getTime();
		this.status = SUBSCRIPTION_STATUSES.ACTIVE;
		this.suspendedAt = null;
		this.suspensionReason = null;
		this._recordEvent("resumed");
	}

	expire() {
		this.status = SUBSCRIPTION_STATUSES.EXPIRED;
		this.expiredAt = new Date();
		this._recordEvent("expired");
	}

	cancel(reason = null) {
		this.status = SUBSCRIPTION_STATUSES.CANCELED;
		this.canceledAt = new Date();
		this.cancellationReason = reason;
		this.autoRenewEnabled = false;
		this._recordEvent("canceled", { reason });
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
		return this.status === SUBSCRIPTION_STATUSES.ACTIVE && this.expiresAt && new Date() < new Date(this.expiresAt);
	}

	isInGracePeriod() {
		return this.status === SUBSCRIPTION_STATUSES.ACTIVE && this.graceEndsAt
			&& new Date() >= new Date(this.expiresAt) && new Date() < new Date(this.graceEndsAt);
	}

	isExpired() {
		return this.status === SUBSCRIPTION_STATUSES.EXPIRED
			|| (this.expiresAt && new Date() >= new Date(this.graceEndsAt || this.expiresAt));
	}

	getRemainingSeconds() {
		if (!this.expiresAt) return 0;
		return Math.max(0, Math.floor((new Date(this.expiresAt).getTime() - Date.now()) / 1000));
	}

	toJSON() { return { ...this }; }
}
