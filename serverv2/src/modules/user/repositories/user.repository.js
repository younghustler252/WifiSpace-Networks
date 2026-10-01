export class UserRepository {
	async paginate({ filter, page, limit, sort, populates, select, lean } = {}) {
		throw new Error("Method 'paginate()' must be implemented.");
	}

	async findById(id, opts = {}) {
		throw new Error("Method 'findById()' must be implemented.");
	}

	async findOne({ filter, populates, sort, select, lean } = {}) {
		throw new Error("Method 'findOne()' must be implemented.");
	}

	async findByEmail(email, opts = {}) {
		throw new Error("Method 'findByEmail()' must be implemented.");
	}

	async findAuthByEmail(email) {
		throw new Error("Method 'findAuthByEmail()' must be implemented.");
	}

	async findAuthById(id) {
		throw new Error("Method 'findAuthById()' must be implemented.");
	}

	async count(filter = {}) {
		throw new Error("Method 'count()' must be implemented.");
	}

	async create(entityOrData, opts = {}) {
		throw new Error("Method 'create()' must be implemented.");
	}

	async update(id, entityOrData, opts = {}) {
		throw new Error("Method 'update()' must be implemented.");
	}

	async updateSecurityState(id, updateData) {
		throw new Error("Method 'updateSecurityState()' must be implemented.");
	}

	async delete(id) {
		throw new Error("Method 'delete()' must be implemented.");
	}

	async getDashboardStats() {
		throw new Error("Method 'getDashboardStats()' must be implemented.");
	}
}