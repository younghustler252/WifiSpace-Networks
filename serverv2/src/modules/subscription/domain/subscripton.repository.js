export class SubscriptionRepository {

	async create(subscription) {
		throw new Error("Not implemented");
	}

	async findById(id) {
		throw new Error("Not implemented");
	}

	async findByAccountId(accountId) {
		throw new Error("Not implemented"); 
	}

	async findActiveByAccount(accountId) {
		throw new Error("Not implemented");
	}

	async findExpired(now) {
		throw new Error("Not implemented");
	}

	async update(id, updateData) {
		throw new Error("Not implemented");
	}

	async updateStatus(id, status) {
		throw new Error("Not implemented");
	}

	async findMany(filter) {
		throw new Error("Not implemented");
	}

}