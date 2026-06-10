import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

import {
	PAYMENT_ACTIONS
} from "../../domain/payment.enum.js";

export class CreatePaymentUseCase {

	constructor({
		paystackPaymentService,
		planRepository
	}) {

		this.paystackPaymentService =
			paystackPaymentService;

		this.planRepository =
			planRepository;
	}

	async execute({
		userId,
		accountId = null,
		planId,
		subscriptionId = null,
		cycles = 1,
		actionType = "new_subscription",
		paymentChannel = null,
		email,
		metadata = {}
	}) {

		// -----------------------------
		// VALIDATION
		// -----------------------------

		if (!email) {

			throw new ValidationError(
				"Email is required"
			);
		}

		if (
			!PAYMENT_ACTIONS.includes(actionType)
		) {

			throw new ValidationError(
				`Invalid action type: ${actionType}`
			);
		}

		if (!planId) {

			throw new ValidationError(
				"Plan ID is required"
			);
		}

		// -----------------------------
		// FETCH PLAN
		// -----------------------------

		const plan =
			await this.planRepository.findById(
				planId
			);

		if (!plan) {

			throw new NotFoundError(
				"Plan not found"
			);
		}

		// -----------------------------
		// CALCULATE AMOUNT
		// -----------------------------

		const total =
			plan.price * cycles;

		const amount = {
			total,
			base: total,
			discount: 0
		};

		// -----------------------------
		// INITIATE PAYMENT
		// -----------------------------

		return await this.paystackPaymentService
			.initiatePayment({
				userId,
				accountId,
				planId,
				subscriptionId,
				amount,
				cycles,
				actionType,
				paymentChannel,
				email,
				metadata
			});
	}
}