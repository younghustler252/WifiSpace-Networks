// src/domain/repositories/subscription.repository.js

export class SubscriptionRepository {

  // Create a new subscription
	async create(subscription) {
		throw new Error("Not implemented");
	}

	// Save domain updates (e.g., when updating subscription)
	async save(subscription) {
		throw new Error("Not implemented");
	}

	// Find a subscription by ID
	async findById(id) {
		throw new Error("Not implemented");
	}

	// Find all subscriptions for an account
	async findByAccountId(accountId) {
		throw new Error("Not implemented");
	}

	// Find an active subscription for an account
	async findActiveByAccount(accountId) {
		throw new Error("Not implemented");
	}

	// Find a suspended subscription for an account (newly added)
	async findSuspendedByAccount(accountId) {
		throw new Error("Not implemented");
	}

	// Find the latest subscription for an account (used in renew fallback)
	async findLatestByAccount(accountId) {
		throw new Error("Not implemented");
	}

	// Find subscriptions that are candidates for expiration
	async findExpiredCandidates(now) {
		throw new Error("Not implemented");
	}

	// Find subscriptions that have expired (legacy method)
	async findExpired(now) {
		throw new Error("Not implemented");
	}

	// Update a subscription
	async update(id, updateData) {
		throw new Error("Not implemented");
	}

	// Update the status of a subscription
	async updateStatus(id, status) {
		throw new Error("Not implemented");
	}

	// Find multiple subscriptions based on a filter
	async findMany(filter) {
		throw new Error("Not implemented");
	}

	// Count the number of subscriptions based on filter criteria
	async count(filter = {}) {
		throw new Error("Not implemented");
	}

	// Count all subscriptions (used for analytics)
	async countAllSubscriptions() {
		throw new Error("Not implemented");
	}

	// Count active subscriptions
	async countActiveSubscriptions() {
		throw new Error("Not implemented");
	}
}