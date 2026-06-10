import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class GetPaymentByIdUseCase {
	constructor({ paymentRepository, accountRepository }) {
		this.paymentRepository = paymentRepository;
		this.accountRepository = accountRepository;
	}

	async execute({ id, userId, userRole }) {
		// =========================
		// VALIDATION
		// =========================
		if (!id) {
			throw new ValidationError("Payment ID is required");
		}

		// =========================
		// FETCH PAYMENT
		// =========================
		const payment = await this.paymentRepository.findById(id);

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		// =========================
		// ADMIN: FULL ACCESS
		// =========================
		if (userRole === "superadmin") {
			return payment;
		}

		// =========================
		// CUSTOMER: OWNERSHIP CHECK
		// =========================
		if (userRole === "customer") {
			// safest check (based on your design: account → user)
			const account = await this.accountRepository.findById(payment.accountId);

			if (!account) {
				throw new NotFoundError("Account not found");
			}

			if (String(account.userId) !== String(userId)) {
				throw new ValidationError("Unauthorized access to payment");
			}

			return payment;
		}

		// =========================
		// UNKNOWN ROLE
		// =========================
		throw new ValidationError("Invalid user role");
	}
}