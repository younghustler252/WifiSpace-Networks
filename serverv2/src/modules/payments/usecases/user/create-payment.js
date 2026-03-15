import { Payment } from "../../domain/entities/payment.entity.js";
import { ValidationError } from "../../../../shared/error/validation-error.js";

export class CreatePaymentUseCase {
	constructor({ paymentRepository, planRepository, paystackService }) {
		this.paymentRepository = paymentRepository;
		this.planRepository = planRepository;
		this.paystackService = paystackService;
	}

	async execute({ userId, planId, amount, monthsPaid, bonusDays = 0, email }) {
		// ----------------------------
		// Validate input
		// ----------------------------
		if (!userId) throw new ValidationError("User ID is required");
		if (!planId) throw new ValidationError("Plan ID is required");
		if (!amount || amount <= 0) throw new ValidationError("Amount must be positive");
		if (!monthsPaid || monthsPaid < 1) throw new ValidationError("Months paid must be at least 1");
		if (!email) throw new ValidationError("User email is required for Paystack");

		// ----------------------------
		// Verify plan exists
		// ----------------------------
		const plan = await this.planRepository.findById(planId);
		if (!plan) throw new ValidationError("Plan not found");

		// ----------------------------
		// Create payment through Paystack service
		// ----------------------------
		const { payment, paystack } = await this.paystackService.initiatePayment({
			userId,
			planId,
			amount,
			monthsPaid,
			bonusDays,
			email
		});

		// ----------------------------
		// Return payment + Paystack init details
		// ----------------------------
		return { payment, paystack };
	}
}