import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreatePaymentUseCase {
	constructor({
		paystackPaymentService,
		planRepository,
		userRepository,
	}) {
		this.paystackPaymentService = paystackPaymentService;
		this.planRepository = planRepository;
		this.userRepository = userRepository;
	}

	async execute({
		userId,
		accountId,
		planId,
		cycles,
	}) {
		// ----------------------------
		// VALIDATION
		// ----------------------------
		if (!userId) throw new ValidationError("User ID is required");
		if (!accountId) throw new ValidationError("Account ID is required");
		if (!planId) throw new ValidationError("Plan ID is required");
		if (!cycles || cycles < 1)
			throw new ValidationError("Cycles must be at least 1");

		// ----------------------------
		// FETCH USER (email comes from DB)
		// ----------------------------
		const user = await this.userRepository.findById(userId);
		if (!user) throw new ValidationError("User not found");
		if (!user.email) throw new ValidationError("User email is missing");

		// ----------------------------
		// VERIFY PLAN
		// ----------------------------
		const plan = await this.planRepository.findById(planId);
		if (!plan) throw new ValidationError("Plan not found");

		// ----------------------------
		// CALCULATE AMOUNT (SERVER TRUTH)
		// ----------------------------
		const amount = plan.price * cycles;

		// ----------------------------
		// CALL PAYMENT SERVICE
		// ----------------------------
		return this.paystackPaymentService.initiatePayment({
			userId,
			accountId,
			planId,
			amount,
			cycles,
			bonusDays: 0,
			email: user.email,
		});
	}
}