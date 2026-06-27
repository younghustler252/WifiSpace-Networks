import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { Payment } from "../../domain/payment.entity.js";
import {
    PAYMENT_CHANNELS,
    PAYMENT_GATEWAYS
} from "../../domain/payment.enum.js";

export class AdminRecordPaymentUseCase {
    constructor({ paymentRepository }) {
        this.paymentRepository = paymentRepository;
    }

    // ==============================
    // RECORD MANUAL PAYMENT
    // ==============================
    async execute({
        userId,
        accountId,
        planId,
        amount,             // { total, base, discount }
        currency = "NGN",
        paymentChannel = "bank_transfer",
        adminNote = null
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

        if (!PAYMENT_CHANNELS.includes(paymentChannel)) {
            throw new ValidationError(`Invalid payment channel: ${paymentChannel}`);
        }

        // -----------------------------
        // CREATE PAYMENT ENTITY
        // -----------------------------
        const payment = new Payment({
            userId,
            accountId,
            planId,
            amount,
            currency,
            actionType: "admin_bypass",
            status: "successful",   // immediately successful
            gateway: "manual",
            paymentChannel,
            idempotencyKey: `ADMIN_${Date.now()}_${Math.random()}`,
            metadata: { adminNote }
        });

        // -----------------------------
        // SAVE PAYMENT
        // -----------------------------
        const savedPayment = await this.paymentRepository.create(payment);

        return savedPayment;
    }
}