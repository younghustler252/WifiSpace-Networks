// admin-update-payment-status.js
import { ValidationError } from "../../../../shared/error/validation-error.js";
import { NotFoundError } from "../../../../shared/error/not-found.js";

export class AdminUpdatePaymentStatusUseCase {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}

	/**
	 * Update payment status
	 * @param {string} paymentId
	 * @param {string} status - "pending" | "successful" | "failed" | "expired"
	 */
	async execute({ paymentId, status }) {
		if (!paymentId) throw new ValidationError("Payment ID is required");
		if (!["pending", "successful", "failed", "expired"].includes(status))
			throw new ValidationError("Invalid payment status");

		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found");

		const updatedPayment = await this.paymentRepository.updateStatus(paymentId, status);
		return updatedPayment;
	}
}