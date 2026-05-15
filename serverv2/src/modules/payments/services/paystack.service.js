import crypto from "crypto";
import { AppError } from "../../../shared/errors/app-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class PaystackPaymentService {
	constructor({ paystackGateway, repository }) {
		this.paystackGateway = paystackGateway;
		this.repository = repository;
	}

	// ==============================
	// CREATE INTERNAL PAYMENT
	// ==============================
	async createInternalPayment({
		userId,
		accountId,
		planId,
		amount,
		cycles,
		bonusDays = 0,
		method = "paystack"
	}) {
		if (!userId || !accountId || !planId) {
			throw new ValidationError(
				"userId, accountId and planId are required"
			);
		}

		if (!amount || amount <= 0) {
			throw new ValidationError("Invalid amount");
		}

		if (!cycles || cycles < 1) {
			throw new ValidationError("Cycles must be at least 1");
		}

		const reference = `PAY_${crypto.randomUUID()}`;

		const payment = {
			userId,
			accountId,
			planId,
			amount,
			cycles,
			bonusDays,
			method,
			status: "pending",
			transactionId: reference
		};

		return await this.repository.create(payment);
	}

	// ==============================
	// INITIATE PAYMENT (PAYSTACK)
	// ==============================
	async initiatePayment({
		userId,
		accountId,
		planId,
		amount,
		cycles,
		bonusDays = 0,
		email
	}) {
		if (!email) {
			throw new ValidationError("Email is required");
		}

		const payment = await this.createInternalPayment({
			userId,
			accountId,
			planId,
			amount,
			cycles,
			bonusDays,
			method: "paystack"
		});

		const paystackResponse =
			await this.paystackGateway.initializeTransaction({
				email,
				amount,
				reference: payment.transactionId,
				callbackUrl: `${process.env.FRONTEND_URL}/user/payment/callback`,
				metadata: {
					userId,
					accountId,
					planId,
					cycles
				}
			});

		return {
			payment,
			paystack: paystackResponse
		};
	}

	// ==============================
	// VERIFY PAYMENT (NO BUSINESS LOGIC)
	// ==============================
	async verifyPayment(reference) {
		if (!reference) {
			throw new ValidationError(
				"Transaction reference is required"
			);
		}

		const payment =
			await this.repository.findByTransactionId(reference);

		if (!payment) {
			throw new AppError("Payment not found", 404);
		}

		// already processed → return early
		if (payment.status === "successful") {
			return {
				payment,
				alreadyProcessed: true
			};
		}

		const result =
			await this.paystackGateway.verifyTransaction(reference);

		// ✅ CRITICAL: validate amount
		const paidAmount = result.raw.amount / 100; // convert kobo → naira
		if (result.status === "successful" && paidAmount !== payment.amount) {
			throw new AppError("Amount mismatch", 400);
		}

		// update status
		await this.repository.updateStatus(
			payment.id,
			result.status
		);

		const updated =
			await this.repository.findById(payment.id);

		return {
			payment: updated,
			gatewayResponse: result,
			alreadyProcessed: false
		};
	}

	// ==============================
	// HANDLE WEBHOOK (SECURE + IDEMPOTENT)
	// ==============================
	async handleWebhook({ payload, signature }) {
		const isValid =
			this.paystackGateway.verifyWebhookSignature(
				payload,
				signature
			);

		if (!isValid) {
			throw new AppError("Invalid webhook signature", 401);
		}

		const event = payload.event;
		const reference = payload.data?.reference;

		if (!reference) return null;

		const payment =
			await this.repository.findByTransactionId(reference);

		if (!payment) return null;

		let status;

		if (event === "charge.success") {
			status = "successful";
		} else if (event === "charge.failed") {
			status = "failed";
		} else {
			return null;
		}

		// idempotency → no duplicate updates
		if (payment.status === status) {
			return payment;
		}

		// ✅ optional: validate amount here too
		if (status === "successful") {
			const paidAmount = payload.data.amount / 100;
			if (paidAmount !== payment.amount) {
				throw new AppError("Webhook amount mismatch", 400);
			}
		}

		await this.repository.updateStatus(payment.id, status);


		return await this.repository.findById(payment.id);
	}
}