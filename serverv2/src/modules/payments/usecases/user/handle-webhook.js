import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class HandleWebhookUseCase {
	constructor({ paystackPaymentService, confirmPaymentUseCase }) {
		this.paystackPaymentService = paystackPaymentService;
		this.confirmPaymentUseCase = confirmPaymentUseCase;
	}

	// ==============================
	// PROCESS PAYSTACK WEBHOOK
	// ==============================
	async execute({ payload, signature }) {
		// -----------------------------
		// VERIFY WEBHOOK SIGNATURE
		// -----------------------------
		const isValid = this.paystackPaymentService.verifyWebhookSignature(
			payload,
			signature
		);

		if (!isValid) {
			throw new AppError("Invalid webhook signature", 401);
		}

		const event = payload.event;
		const reference = payload.data?.reference;

		if (!reference) {
			// no reference, nothing to do
			return null;
		}

		// -----------------------------
		// Use ConfirmPaymentUseCase to handle payment logic
		// -----------------------------
		const { payment, alreadyProcessed } = await this.confirmPaymentUseCase.execute({ reference });

		if (alreadyProcessed) {
			// idempotent: already successful, no further action
			return payment;
		}

		// -----------------------------
		// OPTIONAL: map webhook event to status
		// -----------------------------
		if (event === "charge.success") {
			payment.markSuccessful();
		} else if (event === "charge.failed") {
			payment.markFailed("Charge failed via webhook");
		} else {
			// unknown event, just return
			return payment;
		}

		// -----------------------------
		// SAVE PAYMENT STATE
		// -----------------------------
		return await this.confirmPaymentUseCase.paymentRepository.update(payment);
	}
}