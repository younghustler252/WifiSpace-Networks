import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class GetPaymentByIdUseCase {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}

	async execute({ id }) {
		if (!id) {
			throw new ValidationError("Payment ID is required");
		}

		const payment = await this.paymentRepository.findById(id);

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		return payment;
	}
}