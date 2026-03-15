// get-payment.js
import { NotFoundError } from "../../../../shared/error/not-found.js";

export class GetPaymentUseCase {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}

	/**
	 * Fetch a single payment by ID
	 * @param {string} paymentId
	 * @returns {Promise<Payment>}
	 */
	async execute({ paymentId }) {
		if (!paymentId) throw new Error("Payment ID is required");

		const payment = await this.paymentRepository.findById(paymentId);

		if (!payment) throw new NotFoundError("Payment not found");

		return payment;
	}
}