import crypto from "crypto";

import { Payment } from "../domain/payment.entity.js";
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
		cycles = 1,
		bonusDays = 0,
		paymentChannel = null,
		actionType = "new_subscription",
		renewalStrategy = "manual",
		currency = "NGN"
	}) {
		const reference = `PAY_${crypto.randomUUID()}`;

		const payment = new Payment({
			userId,
			accountId,
			planId,
			amount,
			cycles,
			paymentChannel,
			actionType,
			currency,
			status: "pending",
			gateway: "paystack",
			gatewayReference: reference,
			metadata: {
				bonusDays,
				renewalStrategy
			}
		});

		return await this.repository.create(payment);
	}

	// ==============================
	// INITIATE PAYMENT
	// ==============================
	async initiatePayment({
		userId,
		accountId,
		planId,
		amount,
		cycles = 1,
		bonusDays = 0,
		email,
		actionType = "new_subscription",
		renewalStrategy = "manual"
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
			paymentChannel: null,
			actionType,
			renewalStrategy
		});

		const paystackResponse = await this.paystackGateway.initializeTransaction({
			email,
			amount: amount.total,
			reference: payment.gatewayReference,
			callbackUrl: `${process.env.FRONTEND_URL}/user/payment/callback`,
			metadata: {
				userId,
				accountId,
				planId,
				cycles,
				paymentId: payment.id,
				renewalStrategy
			}
		});

		return {
			payment,
			paystack: paystackResponse
		};
	}

	// ==============================
	// VERIFY PAYMENT
	// ==============================
	async verifyPayment(reference) {
		if (!reference) {
			throw new ValidationError("Payment reference is required");
		}

		const payment = await this.repository.findByGatewayReference(reference);
		if (!payment) throw new AppError("Payment not found", 404);

		// Idempotency: return if already successful
		if (payment.isSuccessful()) {
			return { payment, alreadyProcessed: true };
		}

		const result = await this.paystackGateway.verifyTransaction(reference);
		const paidAmount = result.raw.amount / 100;

		// Amount validation
		if (result.status === "successful" && paidAmount !== payment.amount.total) {
			throw new AppError("Amount mismatch", 400);
		}

		// Save real payment channel
		payment.paymentChannel = result.raw.channel || null;

		// Auto-renew support
		const authorization = result.raw.authorization;
		if (authorization?.reusable) {
			payment.metadata.autoRenewEnabled = true;
			payment.metadata.authorizationReusable = true;
			payment.metadata.authorizationCode = authorization.authorization_code;
		}

		// Status mapping
		if (result.status === "successful") {
			payment.markSuccessful();
		} else if (result.status === "failed") {
			payment.markFailed("Gateway verification failed");
		} else {
			payment.markPending();
		}

		const updated = await this.repository.update(payment);
		return {
			payment: updated,
			gatewayResponse: result,
			alreadyProcessed: false
		};
	}

	// ==============================
	// HANDLE WEBHOOK
	// ==============================
	async handleWebhook({ payload, signature }) {
		const isValid = this.paystackGateway.verifyWebhookSignature(payload, signature);
		if (!isValid) throw new AppError("Invalid webhook signature", 401);

		const event = payload.event;
		const reference = payload.data?.reference;
		if (!reference) return null;

		const payment = await this.repository.findByGatewayReference(reference);
		if (!payment) return null;

		// Idempotency: return if already successful
		if (payment.isSuccessful()) return payment;

		const paidAmount = payload.data.amount / 100;
		if (paidAmount !== payment.amount.total) {
			throw new AppError("Webhook amount mismatch", 400);
		}

		// Save real payment channel
		payment.paymentChannel = payload.data.channel || null;

		// Auto-renew support
		const authorization = payload.data.authorization;
		if (authorization?.reusable) {
			payment.metadata.autoRenewEnabled = true;
			payment.metadata.authorizationReusable = true;
			payment.metadata.authorizationCode = authorization.authorization_code;
		}

		// Status mapping
		if (event === "charge.success") {
			payment.markSuccessful();
		} else if (event === "charge.failed") {
			payment.markFailed("Charge failed");
		} else {
			return null;
		}

		return await this.repository.update(payment);
	}
}