// domain/repositories/user.repository.js

export class UserRepository {
	// Create a new user
	async create(userData) {
		throw new Error("Method 'create()' must be implemented.");
	}

	// Get all users with optional filters, pagination
	async findAll(filter = {}, skip = 0, limit = 50) {
		throw new Error("Method 'findAll()' must be implemented.");
	}

	// Find a user by ID
	async findById(id) {
		throw new Error("Method 'findById()' must be implemented.");
	}

	// Find a user by email
	async findByEmail(email) {
		throw new Error("Method 'findByEmail()' must be implemented.");
	}

	// Find a user including sensitive fields like password (for auth)
	async findAuthByEmail(email) {
		throw new Error("Method 'findAuthByEmail()' must be implemented.");
	}

	// Update user data
	async update(id, updateData) {
		throw new Error("Method 'update()' must be implemented.");
	}

	// Security updates only (password, lock, etc.)
	async updateSecurityState(id, updateData) {
		throw new Error("Method 'updateSecurityState()' must be implemented.");
	}

	// Delete a user
	async delete(id) {
		throw new Error("Method 'delete()' must be implemented.");
	}

	async findVerificationByEmail(email) {
		throw new Error("Method 'findVerificationByEmail()' must be implemented.");
	}
}