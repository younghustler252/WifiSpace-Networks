import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class ReprocessPaymentUseCase {

	constructor({
		paymentRepository,
		paymentProcessorService
	}) {

		this.paymentRepository =
			paymentRepository;

		this.paymentProcessorService =
			paymentProcessorService;
	}

	async execute({ paymentId }) {

		if (!paymentId) {

			throw new ValidationError(
				"Payment ID is required"
			);
		}

		const payment =
			await this.paymentRepository
				.findById(paymentId);

		if (!payment) {

			throw new NotFoundError(
				"Payment not found"
			);
		}

		if (payment.status !== "successful") {

            throw new AppError(
                "Only successful payments can be reprocessed",
                400
            );
        }

		// prevent duplicate processing
		if (payment.businessProcessed) {

			return {
				payment,
				alreadyProcessed: true
			};
		}

		// retry business logic
		const updatedPayment =
			await this.paymentProcessorService
				.process(payment);

		return {
			payment: updatedPayment,
			alreadyProcessed: false
		};
	}
}