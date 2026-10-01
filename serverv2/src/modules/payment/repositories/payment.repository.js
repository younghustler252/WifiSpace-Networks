export class PaymentRepository {
	async create(payment) { throw new Error("Not implemented"); }
	async update(id, entityOrData) { throw new Error("Not implemented"); }
	async findById(id) { throw new Error("Not implemented"); }
	async findByGatewayReference(ref) { throw new Error("Not implemented"); }
	async findByIdempotencyKey(key) { throw new Error("Not implemented"); }
	async findByUser(userId) { throw new Error("Not implemented"); }
	async findByAccount(accountId) { throw new Error("Not implemented"); }
	async paginate(opts) { throw new Error("Not implemented"); }
	async findExpiredPendingPayments(cutoffDate) { throw new Error("Not implemented"); }
	async expirePayments(ids) { throw new Error("Not implemented"); }
	async deleteExpiredPayments(cutoffDate) { throw new Error("Not implemented"); }
	async countAllPayments() { throw new Error("Not implemented"); }
	async countSuccessfulPayments() { throw new Error("Not implemented"); }
}