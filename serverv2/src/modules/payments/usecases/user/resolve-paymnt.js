import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class ResolvePaymentUseCase {

	constructor({
		paymentRepository
	}) {
		this.paymentRepository =
			paymentRepository;
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
		// FIND PAYMENT
		// -----------------------------
		const payment =
			await this.paymentRepository
				.findByGatewayReference(reference);

		if (!payment) {

			throw new NotFoundError(
				"Payment not found"
			);
		}

		const serviceType =
			payment.metadata?.serviceType ||
			"subscription";

		// -----------------------------
		// RESPONSE
		// -----------------------------
		return {
			reference,
			serviceType,

			redirectTo:
				serviceType === "hotspot"
					? "/hotspot/success"
					: "/customer/payment/success"
		};
	}
}