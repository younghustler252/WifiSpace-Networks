export class AdminCreatePaymentUseCase {
	constructor({
		paymentRepository,
		planRepository
	}) {
		this.paymentRepository = paymentRepository;
		this.planRepository = planRepository;
	}

	async execute({
		userId,
		accountId,
		planId,
		amount,
		cycles = 1,
		method = "bank_transfer",
		transactionId = null,
		notes = null
	}) {
		// ================= VALIDATION =================
		if (!userId) throw new Error("User ID is required");
		if (!accountId) throw new Error("Account ID is required");
		if (!planId) throw new Error("Plan ID is required");

		// ================= GET PLAN =================
		const plan = await this.planRepository.findById(planId);

		if (!plan) {
			throw new Error("Plan not found");
		}

		// ================= AMOUNT VALIDATION =================
		const expectedAmount = plan.price * cycles;

		if (amount < expectedAmount) {
			throw new Error(
				`Invalid amount. Expected at least ${expectedAmount}`
			);
		}

		// ================= CREATE PAYMENT =================
		const payment = await this.paymentRepository.create({
			userId,
			accountId,
			planId,

			amount,
			cycles,

			method,

			// offline assumption: admin already verified
			status: "successful",

			transactionId,
			notes
		});

		return payment;
	}
}