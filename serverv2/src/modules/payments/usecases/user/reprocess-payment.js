import { ValidationError }
	from "../../../../shared/errors/validation-error.js";

import { NotFoundError }
	from "../../../../shared/errors/not-found-error.js";

import { AppError }
	from "../../../../shared/errors/app-error.js";

export class ReprocessPaymentUseCase {

	constructor({
		paymentRepository,
		paymentBusinessProcessor
	}) {

		this.paymentRepository =
			paymentRepository;

		this.paymentBusinessProcessor =
			paymentBusinessProcessor;
	}

	async execute({ paymentId }) {

		// -----------------------------------
		// VALIDATION
		// -----------------------------------
		if (!paymentId) {

			throw new ValidationError(
				"Payment ID is required"
			);
		}

		// -----------------------------------
		// FETCH PAYMENT
		// -----------------------------------
		const payment =
			await this.paymentRepository
				.findById(paymentId);

		if (!payment) {

			throw new NotFoundError(
				"Payment not found"
			);
		}

		// -----------------------------------
		// STATUS CHECK
		// -----------------------------------
		if (payment.status !== "successful") {

			throw new AppError(
				"Only successful payments can be reprocessed",
				400
			);
		}

		// -----------------------------------
		// IDEMPOTENCY GUARD
		// -----------------------------------
		if (payment.businessProcessed) {

			return {
				success: true,
				payment,
				alreadyProcessed: true
			};
		}

		// -----------------------------------
		// REPROCESS BUSINESS LOGIC
		// -----------------------------------
		const result =
			await this.paymentBusinessProcessor
				.process(payment);

		// -----------------------------------
		// REFRESH PAYMENT
		// -----------------------------------
		const updatedPayment =
			await this.paymentRepository
				.findById(payment.id);

		// -----------------------------------
		// RESPONSE
		// -----------------------------------
		return {
			success: true,
			payment: updatedPayment,
			result,
			alreadyProcessed: false
		};
	}
}