import { ValidationError } from "../../../shared/errors/validation-error.js";

export class Payment {
	constructor({
		id,
		userId,
		accountId = null,
		wsnId = null,
		planId,
		amount,
		cycles,
		bonusDays = 0,
		method,
		status = "pending",
		transactionId = null,
		paymentDate = new Date(),
		paymentDetails = {},
		processed = false
	}) {
		this.validate({
			userId,
			planId,
			amount,
			cycles,
			method,
			status
		});

		this.id = id;
		this.userId = userId;
		this.accountId = accountId;
		this.wsnId = wsnId;
		this.planId = planId;
		this.amount = amount;
		this.cycles = cycles;
		this.bonusDays = bonusDays;
		this.method = method;
		this.status = status;
		this.transactionId = transactionId;
		this.paymentDate = paymentDate;
		this.paymentDetails = paymentDetails;

		// idempotency flag
		this.processed = processed;
	}

	validate({
		userId,
		planId,
		amount,
		cycles,
		method,
		status
	}) {
		const validMethods = [
			"paystack",
			"credit_card",
			"bank_transfer"
		];

		const validStatus = [
			"pending",
			"successful",
			"failed",
			"expired"
		];

		if (!userId)
			throw new ValidationError("User ID is required");

		if (!planId)
			throw new ValidationError("Plan ID is required");

		if (!amount || amount <= 0)
			throw new ValidationError(
				"Amount must be positive"
			);

		if (!cycles || cycles < 1)
			throw new ValidationError(
				"Cycles must be at least 1"
			);

		if (!validMethods.includes(method)) {
			throw new ValidationError("Invalid payment method");
		}

		if (!validStatus.includes(status)) {
			throw new ValidationError("Invalid payment status");
		}
	}

	// ==============================
	// STATE METHODS
	// ==============================
	markSuccessful() {
		this.status = "successful";
	}

	markFailed() {
		this.status = "failed";
	}

	markPending() {
		this.status = "pending";
	}

	markExpired() {
		this.status = "expired";
	}

	markProcessed() {
		this.processed = true;
	}
}