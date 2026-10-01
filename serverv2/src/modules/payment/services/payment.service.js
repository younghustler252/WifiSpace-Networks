import crypto from "crypto";
import { Payment } from "../domain/payment.entity.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

// CHANGED: renamed from PaystackPaymentService. This class no longer knows
// Paystack exists — it asks paymentGatewayRegistry for whichever gateway
// `payment.gateway` says to use, and only calls the four contract methods
// (initializeTransaction, verifyTransaction, verifyWebhookSignature,
// parseWebhookEvent). Adding a second gateway means writing a new gateway
// class + registering it — this file does not change.
export class PaymentService {
	constructor({ paymentGatewayRegistry, paymentRepository }) {
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.paymentRepository = paymentRepository;
	}

	// ==============================
	// CREATE INTERNAL PAYMENT
	// ==============================
	async createInternalPayment({
		userId,
		accountId,
		planId,
		subscriptionId = null,
		amount,
		cycles = 1,
		bonusDays = 0,
		paymentChannel = null,
		actionType = "new_subscription",
		gateway = "paystack", // CHANGED: was implicitly always "paystack"
		renewalStrategy = "manual",
		currency = "NGN",
		metadata = {}
	}) {
		const reference = `PAY_${crypto.randomUUID()}`;

		const payment = new Payment({
			userId,
			accountId,
			planId,
			subscriptionId, // CHANGED: was duplicated (`subscriptionId, subscriptionId,`) in the original — harmless in JS object literals but worth cleaning up
			amount,
			cycles,
			paymentChannel,
			actionType,
			gateway,
			currency,
			status: "initiated", // CHANGED: was "pending" — "initiated" is the correct starting status per PAYMENT_STATUSES; "pending" means the gateway has been contacted and hasn't resolved yet, which isn't true until initiatePayment actually calls out
			businessProcessed: false,
			gatewayReference: reference,
			metadata: {
				...metadata,
				bonusDays,
				renewalStrategy
			}
		});

		return await this.paymentRepository.create(payment);
	}

	// ==============================
	// INITIATE PAYMENT
	// ==============================
	async initiatePayment({
		userId,
		accountId,
		planId,
		subscriptionId = null,
		amount,
		cycles = 1,
		bonusDays = 0,
		email,
		paymentChannel = null,
		actionType = "new_subscription",
		gateway = "paystack",
		renewalStrategy = "manual",
		metadata = {},
		callbackUrl = `${process.env.FRONTEND_URL}/payments/callback`
	}) {
		if (!email) {
			throw new ValidationError("Email is required");
		}

		const payment = await this.createInternalPayment({
			userId,
			accountId,
			planId,
			subscriptionId,
			amount,
			cycles,
			bonusDays,
			paymentChannel,
			actionType,
			gateway,
			renewalStrategy,
			metadata
		});

		const provider = this.paymentGatewayRegistry.get(gateway);

		const gatewayResponse = await provider.initializeTransaction({
			email,
			amount: amount.total,
			reference: payment.gatewayReference,
			callbackUrl, // CHANGED: was the hardcoded template literal directly here
			metadata: {
				...metadata,
				userId,
				accountId,
				planId,
				cycles,
				paymentId: payment.id,
				renewalStrategy
			}
		});

		return { payment, gatewayResponse };
	}

	// ==============================
	// VERIFY PAYMENT
	// ==============================
	async verifyPayment(reference) {
		if (!reference) {
			throw new ValidationError("Payment reference is required");
		}

		const payment = await this.paymentRepository.findByGatewayReference(reference);
		if (!payment) throw new AppError("Payment not found", 404);

		// Idempotency: return if already successful — this only means "the
		// gateway already confirmed this charge", NOT "business processing
		// already ran". See confirm-payment.js for why that distinction matters.
		if (payment.isSuccessful()) {
			return { payment, alreadyProcessed: true };
		}

		const provider = this.paymentGatewayRegistry.get(payment.gateway);
		const result = await provider.verifyTransaction(reference);
		const paidAmount = result.raw.amount / 100;

		if (result.status === "successful" && paidAmount !== payment.amount.total) {
			throw new AppError("Amount mismatch", 400);
		}

		payment.paymentChannel = result.raw.channel || null;

		const authorization = result.raw.authorization;
		if (authorization?.reusable) {
			payment.metadata.autoRenewEnabled = true;
			payment.metadata.authorizationReusable = true;
			payment.metadata.authorizationCode = authorization.authorization_code;
		}

		if (result.status === "successful") {
			payment.markSuccessful();
		} else if (result.status === "failed") {
			payment.markFailed("Gateway verification failed");
		} else {
			payment.markPending();
		}

		const updated = await this.paymentRepository.update(payment);
		return { payment: updated, gatewayResponse: result, alreadyProcessed: false };
	}

	// ==============================

	async handleWebhook({ payload, signature, rawBody, gateway }) {
		if (!gateway) {
			throw new ValidationError("gateway is required to process a webhook");
		}

		const provider = this.paymentGatewayRegistry.get(gateway);

		const isValid = provider.verifyWebhookSignature(rawBody, signature);
		if (!isValid) throw new AppError("Invalid webhook signature", 401);

		// CHANGED: all Paystack-specific payload parsing (payload.event,
		// payload.data.reference, etc.) now lives inside the gateway class,
		// not here. This method works identically for any future gateway that
		// implements parseWebhookEvent().
		const parsed = provider.parseWebhookEvent(payload);
		if (!parsed || !parsed.reference) return null;

		const payment = await this.paymentRepository.findByGatewayReference(parsed.reference);
		if (!payment) return null;

		// NEW: mark that a webhook actually arrived and was validated for this
		// payment — set here regardless of what status it turns out to carry,
		// so "webhook never arrived" is distinguishable from "webhook arrived,
		// business logic hasn't run yet" (businessProcessed).
		payment.isWebhookProcessed = true;

		if (payment.isSuccessful()) return payment;

		const paidAmount = parsed.amountKobo / 100;
		if (paidAmount !== payment.amount.total) {
			throw new AppError("Webhook amount mismatch", 400);
		}

		payment.paymentChannel = parsed.channel;

		if (parsed.authorization?.reusable) {
			payment.metadata.autoRenewEnabled = true;
			payment.metadata.authorizationReusable = true;
			payment.metadata.authorizationCode = parsed.authorization.authorization_code;
		}

		if (parsed.status === "successful") {
			payment.markSuccessful();
		} else if (parsed.status === "failed") {
			payment.markFailed("Charge failed");
		} else {
			return null;
		}

		return await this.paymentRepository.update(payment);
	}
}