import { AppError } from "../../../../shared/errors/app-error.js";

export class HandleWebhookUseCase {
	constructor({
		paystackPaymentService,
		confirmPayment
	}) {
		this.paystackPaymentService =
			paystackPaymentService;

		this.confirmPayment = confirmPayment;
	}

	async execute({ payload, signature }) {

		// -----------------------------
		// VERIFY SIGNATURE
		// -----------------------------
		const isValid =
			this.paystackPaymentService.verifyWebhookSignature(
				payload,
				signature
			);

		if (!isValid) {
			throw new AppError(
				"Invalid webhook signature",
				401
			);
		}

		// -----------------------------
		// EXTRACT DATA
		// -----------------------------
		const reference =
			payload.data?.reference;

		if (!reference) {
			return null;
		}

		// -----------------------------
		// DELEGATE TO DOMAIN FLOW
		// -----------------------------
		const result =
			await this.confirmPayment.execute({
				reference
			});

		// -----------------------------
		// RETURN RESULT
		// -----------------------------
		return result.payment;
	}
}