import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class GetPaymentById {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}
	async execute({ paymentId }) {
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);
		return payment;
	}
}