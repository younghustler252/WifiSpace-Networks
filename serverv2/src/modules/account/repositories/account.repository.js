export class AccountRepository {
	async create(accountEntity) { throw new Error("Not implemented"); }
	async findById(id, options = {}) { throw new Error("Not implemented"); }
	async paginate(opts = {}) { throw new Error("Not implemented"); }
	async findOne(filters, options = {}) { throw new Error("Not implemented"); }
	async findByWsnId(wsnId) { throw new Error("Not implemented"); }
	async findByUserId(userId) { throw new Error("Not implemented"); }
	async findByMac(macAddress) { throw new Error("Not implemented"); }
	async update(id, data) { throw new Error("Not implemented"); }
	async findRouterCredentials(id) { throw new Error("Not implemented"); }
	async ensureRouterCredentials(id) { throw new Error("Not implemented"); }
	async deleteById(id) { throw new Error("Not implemented"); }
	async generateWsnId(prefix) { throw new Error("Not implemented"); }
	async countAllAccounts() { throw new Error("Not implemented"); }
	async getDashboardStats() { throw new Error("Not implemented"); }
}
