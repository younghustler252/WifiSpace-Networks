import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class UsageSummary {
	constructor({
		id, subscriptionId, accountId,
		totalBytesUsed = 0, totalSecondsUsed = 0,
		dataCapBytes = 0, durationSeconds = 0,
		lastSyncedAt = null, createdAt = null, updatedAt = null
	}) {
		if (!subscriptionId) throw new ValidationError("Subscription ID is required");
		if (!accountId) throw new ValidationError("Account ID is required");

		Object.assign(this, { id, subscriptionId, accountId, totalBytesUsed, totalSecondsUsed, dataCapBytes, durationSeconds, lastSyncedAt, createdAt, updatedAt });
	}

	addUsage({ bytesUsed = 0, secondsUsed = 0 }) {
		this.totalBytesUsed += bytesUsed;
		this.totalSecondsUsed += secondsUsed;
		this.lastSyncedAt = new Date();
	}

	isDataUnlimited() { return this.dataCapBytes === 0; }

	getRemainingBytes() {
		if (this.isDataUnlimited()) return null;
		return Math.max(0, this.dataCapBytes - this.totalBytesUsed);
	}

	getRemainingSeconds() {
		return Math.max(0, this.durationSeconds - this.totalSecondsUsed);
	}

	isDataExhausted() {
		return !this.isDataUnlimited() && this.totalBytesUsed >= this.dataCapBytes;
	}

	isTimeExhausted() {
		return this.durationSeconds > 0 && this.totalSecondsUsed >= this.durationSeconds;
	}

	getDataUsagePercent() {
		if (this.isDataUnlimited()) return 0;
		return Math.min(100, Math.round((this.totalBytesUsed / this.dataCapBytes) * 100));
	}

	toJSON() { return { ...this }; }
}