import crypto from "crypto";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

import { Payment } from "../../domain/payment.entity.js";
import {
	PAYMENT_STATUSES,
	PAYMENT_CHANNELS,
	PAYMENT_ACTIONS,
	PAYMENT_GATEWAYS
} from "../../domain/payment.enum.js";

export class CreatePaymentUseCase {
	constructor({ paymentRepository, paystackPaymentService }) {
		this.paymentRepository = paymentRepository;
		this.paystackPaymentService = paystackPaymentService;
	}

	// ==============================
	// CREATE PAYMENT
	// ==============================
	async execute({
		userId,
		accountId,
		planId,
		cycles = 1,
		actionType = "new_subscription", // "new_subscription" | "renewal" | "upgrade"
		amount, // { total, base, discount }
		paymentChannel = null,
		currency = "NGN"
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!userId) throw new ValidationError("User ID is required");
		if (!accountId) throw new ValidationError("Account ID is required");
		if (!planId) throw new ValidationError("Plan ID is required");

		if (!amount || typeof amount.total !== "number" || amount.total <= 0) {
			throw new ValidationError("Invalid amount");
		}

		if (cycles < 1) throw new ValidationError("Cycles must be >= 1");

		if (!PAYMENT_ACTIONS.includes(actionType)) {
			throw new ValidationError(`Invalid action type: ${actionType}`);
		}

		if (paymentChannel && !PAYMENT_CHANNELS.includes(paymentChannel)) {
			throw new ValidationError(`Invalid payment channel: ${paymentChannel}`);
		}

		// -----------------------------
		// CREATE PAYMENT ENTITY
		// -----------------------------
		const gatewayReference = `PAY_${crypto.randomUUID()}`;

		const payment = new Payment({
			userId,
			accountId,
			planId,
			actionType,
			amount,
			currency,
			cycles,
			paymentChannel,
			status: "pending",
			gateway: "paystack",
			gatewayReference
		});

		// -----------------------------
		// SAVE PAYMENT
		// -----------------------------
		const savedPayment = await this.paymentRepository.create(payment);

		return savedPayment;
	}

	// ==============================
	// INITIATE PAYMENT VIA PAYSTACK
	// ==============================
	async initiate({
		userId,
		accountId,
		planId,
		cycles = 1,
		actionType = "new_subscription",
		amount,
		paymentChannel = null,
		email
	}) {
		if (!email) throw new ValidationError("Email is required");

		// 1️⃣ Create internal payment
		const payment = await this.execute({
			userId,
			accountId,
			planId,
			cycles,
			actionType,
			amount,
			paymentChannel
		});

		// 2️⃣ Initialize Paystack transaction
		const paystackResponse = await this.paystackPaymentService.paystackGateway.initializeTransaction({
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
				actionType
			}
		});

		return {
			payment,
			paystack: paystackResponse
		};
	}
}