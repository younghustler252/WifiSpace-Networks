// payment.repository.js
import { Payment } from "../entities/payment.entity.js";

export class PaymentRepository {
	/**
	 * Save a new payment
	 * @param {Payment} payment
	 * @returns {Promise<Payment>}
	 */
	async create(payment) {
		throw new Error("Method not implemented");
	}

	/**
	 * Find payment by ID
	 * @param {string} id
	 * @returns {Promise<Payment|null>}
	 */
	async findById(id) {
		throw new Error("Method not implemented");
	}

	/**
	 * Find all payments for a user
	 * @param {string} userId
	 * @returns {Promise<Payment[]>}
	 */
	async findByUser(userId) {
		throw new Error("Method not implemented");
	}

	/**
	 * Find all pending payments
	 * @returns {Promise<Payment[]>}
	 */
	async findPendingPayments() {
		throw new Error("Method not implemented");
	}

	/**
	 * Update payment status
	 * @param {string} id
	 * @param {string} status
	 * @returns {Promise<Payment|null>}
	 */
	async updateStatus(id, status) {
		throw new Error("Method not implemented");
	}
}