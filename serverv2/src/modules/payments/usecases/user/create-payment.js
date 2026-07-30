import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

import { PAYMENT_ACTIONS } from "../../domain/payment.enum.js";

export class CreatePaymentUseCase {

	constructor({
		paymentService, // CHANGED: was paystackPaymentService
		planRepository,
		userRepository
	}) {
		this.paymentService = paymentService;
		this.planRepository = planRepository;
		this.userRepository = userRepository;
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
		metadata = {},
		callbackUrl // NEW — passed through untouched; undefined falls back to paymentService's default
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!email && userId) {
			const user = await this.userRepository.findById(userId);
			if (user?.email) {
				email = user.email;
			}
		}

		if (!email) {
			throw new ValidationError("Email is required");
		}

		if (!PAYMENT_ACTIONS.includes(actionType)) {
			throw new ValidationError(`Invalid action type: ${actionType}`);
		}

		if (!planId) {
			throw new ValidationError("Plan ID is required");
		}

		// NEW: Payment.accountId is now required at the schema level (needed
		// by PaymentBusinessProcessor to fetch the real Account). Failing here
		// with a clear message beats letting Mongoose throw a validation error
		// at save time inside paymentService.initiatePayment().
		if (!accountId) {
			throw new ValidationError("accountId is required");
		}

		// -----------------------------
		// FETCH PLAN
		// -----------------------------
		const plan = await this.planRepository.findById(planId);
		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		// -----------------------------
		// CALCULATE AMOUNT
		// -----------------------------
		const total = plan.price * cycles;
		const amount = { total, base: total, discount: 0 };

		// -----------------------------
		// INITIATE PAYMENT
		// -----------------------------
		// CHANGED: return shape from this call is now { payment, gatewayResponse }
		// (was { payment, paystack }). If your controller reads `.paystack` off
		// this result to get the checkout redirect URL, it needs updating too —
		// see chat.
		return await this.paymentService.initiatePayment({
			userId,
			accountId,
			planId,
			subscriptionId,
			amount,
			cycles,
			actionType,
			paymentChannel,
			email,
			metadata,
			callbackUrl // NEW
		});
	}
}