import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class ConfirmPaymentUseCase {

	constructor({
		paymentRepository,
		paystackPaymentService,
		paymentProcessorResolver
	}) {

		this.paymentRepository =
			paymentRepository;

		this.paystackPaymentService =
			paystackPaymentService;

		this.paymentProcessorResolver =
			paymentProcessorResolver;
	}

	async execute({ reference }) {

		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!reference) {

			throw new ValidationError(
				"Payment reference is required"
			);
		}

		// -----------------------------
		// FETCH PAYMENT
		// -----------------------------
		const existingPayment =
			await this.paymentRepository
				.findByGatewayReference(reference);

		if (!existingPayment) {

			throw new NotFoundError(
				"Payment not found"
			);
		}

		// -----------------------------
		// VERIFY PAYMENT WITH GATEWAY
		// -----------------------------
		const {
			payment,
			gatewayResponse,
			alreadyProcessed
		} =
			await this.paystackPaymentService
				.verifyPayment(reference);

		// -----------------------------
		// IDEMPOTENCY GUARD
		// -----------------------------
		if (alreadyProcessed) {

			return {
				payment,
				gatewayResponse,
				alreadyProcessed: true
			};
		}

		// -----------------------------
		// ONLY PROCESS SUCCESSFUL
		// -----------------------------
		if (!payment.isSuccessful()) {

			return {
				payment,
				gatewayResponse,
				alreadyProcessed: false
			};
		}

		// -----------------------------
		// BUSINESS ALREADY PROCESSED
		// -----------------------------
		if (payment.businessProcessed) {

			return {
				payment,
				gatewayResponse,
				alreadyProcessed: true
			};
		}

		// -----------------------------
		// PROCESS BUSINESS LOGIC
		// -----------------------------
		const serviceType =
			payment.metadata?.serviceType ?? "default";

		const processor =
			this.paymentProcessorResolver.resolve(
				serviceType
			);
		await processor.process(payment);
		// -----------------------------
		// REFETCH UPDATED PAYMENT
		// -----------------------------
		const updatedPayment =
			await this.paymentRepository
				.findById(payment.id);

		// -----------------------------
		// RESPONSE
		// -----------------------------
		return {
			payment: updatedPayment,
			gatewayResponse,
			alreadyProcessed: false
		};
	}
}