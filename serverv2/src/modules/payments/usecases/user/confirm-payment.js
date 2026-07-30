import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class ConfirmPaymentUseCase {
	constructor({
		paymentRepository,
		paymentService, 
		paymentBusinessProcessor
	}) {
		this.paymentRepository = paymentRepository;
		this.paymentService = paymentService;
		this.paymentBusinessProcessor = paymentBusinessProcessor;
	}

	async execute({ reference }) {
		if (!reference) {
			throw new ValidationError("Payment reference is required");
		}

		const existingPayment = await this.paymentRepository.findByGatewayReference(reference);
		if (!existingPayment) {
			throw new NotFoundError("Payment not found");
		}

		const { payment, gatewayResponse } = await this.paymentService.verifyPayment(reference);

		// Only businessProcessed means "we already ran subscription + activation
		// logic". isSuccessful()/alreadyProcessed only means the gateway
		// confirmed the charge - treating those as equivalent was the bug that
		// made every webhook-driven confirmation silently no-op.
		if (payment.businessProcessed) {
			return {
				success: true,
				payment,
				gatewayResponse,
				alreadyProcessed: true,
				autoConnected: true
			};
		}

		if (!payment.isSuccessful()) {
			return {
				success: false,
				payment,
				gatewayResponse,
				alreadyProcessed: false,
				autoConnected: false
			};
		}

		const result = await this.paymentBusinessProcessor.process(payment);

		const updatedPayment = await this.paymentRepository.findById(payment.id);
		const autoConnectedStatus = result?.autoConnected ?? false;

		return {
			success: true,
			payment: updatedPayment,
			gatewayResponse,
			alreadyProcessed: false,
			result,
			autoConnected: autoConnectedStatus
		};
	}
}