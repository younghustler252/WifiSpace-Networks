// modules/payments/services/paystack.service.js
import Paystack from "paystack-api";
import { Payment } from "../entities/payment.entity.js";
import { AppError } from "../../../../shared/error/app-error.js";

export class PaystackPaymentService {
	constructor({ repository, secretKey }) {
		this.repository = repository;
		this.paystack = new Paystack(secretKey);
	}

	async createInternalPayment({ userId, accountId = null, wsnId = null, planId, amount, monthsPaid, bonusDays = 0, method = "bank_transfer", status = "pending" }) {
		const payment = new Payment({ userId, accountId, wsnId, planId, amount, monthsPaid, bonusDays, method, status });
		return this.repository.create(payment);
	}

	async initiatePayment({ userId, accountId = null, wsnId = null, planId, amount, monthsPaid, bonusDays = 0, email }) {
		try {
			// create pending payment internally
			const savedPayment = await this.createInternalPayment({ userId, accountId, wsnId, planId, amount, monthsPaid, bonusDays, method: "paystack", status: "pending" });

			const paystackResponse = await this.paystack.transaction.initialize({
				email,
				amount: amount * 100,
				reference: savedPayment.id.toString()
			});

			return { payment: savedPayment, paystack: paystackResponse };
		} catch (err) {
			throw new AppError("Failed to initiate Paystack payment", 500, "PAYSTACK_ERROR", err);
		}
	}

	async verifyPayment(reference) {
		try {
			const payment = await this.repository.findByReference(reference);
			if (!payment) throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");

			const response = await this.paystack.transaction.verify({ reference });

			let status = "pending";
			if (response.data.status === "success") status = "successful";
			else if (response.data.status === "failed") status = "failed";

			return this.repository.updateStatus(payment.id, status);
		} catch (err) {
			throw new AppError("Failed to verify Paystack payment", 500, "PAYSTACK_VERIFY_ERROR", err);
		}
	}

	async handleWebhook(payload) {
		const reference = payload.data.reference;
		const event = payload.event;

		if (!reference) return null;

		let status;
		if (event === "charge.success") status = "successful";
		else if (event === "charge.failed") status = "failed";
		else return null;

		const payment = await this.repository.findByReference(reference);
		if (!payment) return null;

		return this.repository.updateStatus(payment.id, status);
	}
}