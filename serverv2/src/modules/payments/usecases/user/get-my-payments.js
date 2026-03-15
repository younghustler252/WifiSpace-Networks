import { ValidationError } from "../../../../shared/error/validation-error.js";

export class GetMyPaymentsUseCase {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}

	/**
	 * Get payments for a user with optional filters and pagination
	 * @param {string} userId
	 * @param {Object} filters - status, planId, startDate, endDate
	 * @param {number} page
	 * @param {number} limit
	 */
	async execute({ userId, filters = {}, page = 1, limit = 10 }) {
		if (!userId) throw new ValidationError("User ID is required");

		const skip = (page - 1) * limit;

		const payments = await this.paymentRepository.findPayments({
			userId,
			planId: filters.planId,
			status: filters.status,
			startDate: filters.startDate,
			endDate: filters.endDate,
			limit,
			skip
		});

		const total = await this.paymentRepository.countPayments({
			userId,
			planId: filters.planId,
			status: filters.status,
			startDate: filters.startDate,
			endDate: filters.endDate
		});

		return {
			data: payments,
			meta: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit)
			}
		};
	}
}