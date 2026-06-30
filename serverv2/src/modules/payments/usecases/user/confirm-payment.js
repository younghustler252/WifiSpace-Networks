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
		// VERIFY PAYMENT WITH GATEWAY
		// --------------------------------------------------
		const {
			payment,
			gatewayResponse,
			alreadyProcessed
		} =
			await this.paystackPaymentService
				.verifyPayment(reference);

		// --------------------------------------------------
		// ✅ FIXED IDEMPOTENCY PATHS: Keep user logged in on page reloads
		// --------------------------------------------------
		if (alreadyProcessed || payment.businessProcessed) {
			return {
				success: true,
				payment,
				gatewayResponse,
				alreadyProcessed: true,
				autoConnected: true 
			};
		}

		// --------------------------------------------------
		// FAILED PAYMENT HANDLING
		// --------------------------------------------------
		if (!payment.isSuccessful()) {
			return {
				success: false,
				payment,
				gatewayResponse,
				alreadyProcessed: false,
				autoConnected: false
			};
		}

		// --------------------------------------------------
		// PROCESS BUSINESS FLOW (PROVISION ACCESS TIER)
		// --------------------------------------------------
		const result =
			await this.paymentBusinessProcessor
				.process(payment);

		// --------------------------------------------------
		// RELOAD REFRESHED PAYMENT DATA FROM DATABASE
		// --------------------------------------------------
		const updatedPayment =
			await this.paymentRepository
				.findById(payment.id);

		// ✅ FIXED: Safely unpacks from the root level of your updated PaymentBusinessProcessor
		const autoConnectedStatus = result?.autoConnected ?? false;

		// --------------------------------------------------
		// UNIFIED ROOT LEVEL RESPONSE FOR NEXT.JS
		// --------------------------------------------------
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
