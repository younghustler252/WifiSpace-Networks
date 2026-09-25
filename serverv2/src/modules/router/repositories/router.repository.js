export class RouterRepository {
	async create(router) {}

	async findById(id) {}

	async findByCode(code) {}

	async findByHost(host) {}

	async findDefaultRouter() {}

	async findAvailableRouters() {}

	async findProvisionableRouter(type) {}

	async update(router) {}

	async delete(id) {}

	async updateStatus(id, status) {}

	async incrementSessions(id) {}

	async decrementSessions(id) {}
}