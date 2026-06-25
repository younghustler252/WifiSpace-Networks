import { ValidationError }
	from "../../../../shared/errors/validation-error.js";

import { NotFoundError }
	from "../../../../shared/errors/not-found-error.js";

export class ConfirmPaymentUseCase {

	constructor({
		paymentRepository,
		paystackPaymentService,
		paymentBusinessProcessor
	}) {

		this.paymentRepository =
			paymentRepository;

		this.paystackPaymentService =
			paystackPaymentService;

		this.paymentBusinessProcessor =
			paymentBusinessProcessor;
	}

	async execute({ reference }) {

		// --------------------------------------------------
		// VALIDATION
		// --------------------------------------------------
		if (!reference) {

			throw new ValidationError(
				"Payment reference is required"
			);
		}

		// --------------------------------------------------
		// PAYMENT MUST EXIST
		// --------------------------------------------------
		const existingPayment =
			await this.paymentRepository
				.findByGatewayReference(reference);

		if (!existingPayment) {

			throw new NotFoundError(
				"Payment not found"
			);
		}

		// --------------------------------------------------
		// VERIFY PAYMENT
		// --------------------------------------------------
		const {
			payment,
			gatewayResponse,
			alreadyProcessed
		} =
			await this.paystackPaymentService
				.verifyPayment(reference);

		// --------------------------------------------------
		// IDEMPOTENCY
		// --------------------------------------------------
		if (alreadyProcessed) {

			return {
				success: true,
				payment,
				gatewayResponse,
				alreadyProcessed: true
			};
		}

		// --------------------------------------------------
		// FAILED PAYMENT
		// --------------------------------------------------
		if (!payment.isSuccessful()) {

			return {
				success: false,
				payment,
				gatewayResponse,
				alreadyProcessed: false
			};
		}

		// --------------------------------------------------
		// BUSINESS ALREADY PROCESSED
		// --------------------------------------------------
		if (payment.businessProcessed) {

			return {
				success: true,
				payment,
				gatewayResponse,
				alreadyProcessed: true
			};
		}

		// --------------------------------------------------
		// PROCESS BUSINESS FLOW
		// --------------------------------------------------
		const result =
			await this.paymentBusinessProcessor
				.process(payment);

		// --------------------------------------------------
		// RELOAD PAYMENT
		// --------------------------------------------------
		const updatedPayment =
			await this.paymentRepository
				.findById(payment.id);

		// --------------------------------------------------
		// RESPONSE
		// --------------------------------------------------
		return {
			success: true,

			payment:
				updatedPayment,

			gatewayResponse,

			alreadyProcessed:
				false,

			result
		};
	}
}