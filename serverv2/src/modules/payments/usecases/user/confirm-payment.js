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

		if (!payment.isSuccessful()) {
			return {
				success: false,
				payment,
				gatewayResponse,
				alreadyProcessed: false,
				autoConnected: false
			};
		}

		// CHANGED: removed the `if (payment.businessProcessed) return early`
		// branch entirely — that was the source of the original bug (every
		// webhook-driven confirmation silently no-op'd) AND the more recent
		// one (a failed activation could never be retried). Capture the
		// pre-call value here just for reporting — the retry/skip decision
		// now lives inside paymentBusinessProcessor.process() itself, which
		// reloads an existing subscription instead of recreating it but
		// still always attempts activation.
		const wasAlreadyBusinessProcessed = payment.businessProcessed;

		const result = await this.paymentBusinessProcessor.process(payment);

		const updatedPayment = await this.paymentRepository.findById(payment.id);

		return {
			success: result?.success !== false,
			payment: updatedPayment,
			gatewayResponse,
			alreadyProcessed: wasAlreadyBusinessProcessed,
			result,
			autoConnected: result?.autoConnected ?? false
		};
	}
}