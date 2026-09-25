export class RouterProvisioning {
	constructor({
		id,
		accountId,
		subscriptionId,
		routerId,
		status = "not_started",
		lastSyncedAt = null,
		lastError = null,
		createdAt = null,
		updatedAt = null
	}) {
		if (!accountId) throw new Error("accountId is required");
		if (!subscriptionId) throw new Error("subscriptionId is required");
		if (!routerId) throw new Error("routerId is required");

		this.id = id;
		this.accountId = accountId;
		this.subscriptionId = subscriptionId;
		this.routerId = routerId;
		this.status = status;
		this.lastSyncedAt = lastSyncedAt;
		this.lastError = lastError;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	isSynced() {
		return this.status === "synced";
	}

	isFailed() {
		return this.status === "failed";
	}

	needsProvisioning() {
		return this.status !== "synced";
	}

	markSynced() {
		this.status = "synced";
		this.lastSyncedAt = new Date();
		this.lastError = null;
	}

	markFailed(error) {
		this.status = "failed";
		this.lastError = error;
		this.lastSyncedAt = new Date();
	}
}