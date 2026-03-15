// modules/payments/domain/payment.entity.js
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class Payment {
	constructor({
		id,
		userId,
		accountId = null,
		wsnId = null,
		planId,
		amount,
		monthsPaid,
		bonusDays = 0,
		method,
		status = "pending",
		transactionId = null,
		paymentDate = new Date(),
		subscriptionStartDate = null,
		subscriptionEndDate = null,
		paymentDetails = {}
	}) {
		this.validate({
			userId,
			planId,
			amount,
			monthsPaid,
			method,
			status
		});

		this.id = id;
		this.userId = userId;
		this.accountId = accountId;
		this.wsnId = wsnId;
		this.planId = planId;
		this.amount = amount;
		this.monthsPaid = monthsPaid;
		this.bonusDays = bonusDays;
		this.method = method;
		this.status = status;
		this.transactionId = transactionId;
		this.paymentDate = paymentDate;
		this.subscriptionStartDate = subscriptionStartDate;
		this.subscriptionEndDate = subscriptionEndDate;
		this.paymentDetails = paymentDetails;
	}

	validate({ userId, planId, amount, monthsPaid, method, status }) {
		const validMethods = ["paystack", "wallet", "bank_transfer"];
		const validStatus = ["pending", "successful", "failed", "expired"];

		if (!userId) throw new ValidationError("User ID is required");
		if (!planId) throw new ValidationError("Plan ID is required");
		if (!amount || amount <= 0) throw new ValidationError("Amount must be positive");
		if (!monthsPaid || monthsPaid < 1) throw new ValidationError("Months paid must be at least 1");
		if (!validMethods.includes(method)) throw new ValidationError("Invalid payment method");
		if (!validStatus.includes(status)) throw new ValidationError("Invalid payment status");
	}

	markSuccessful() { this.status = "successful"; }
	markFailed() { this.status = "failed"; }
	markPending() { this.status = "pending"; }
	markExpired() { this.status = "expired"; }
}