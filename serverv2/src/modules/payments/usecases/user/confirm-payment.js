import { Payment } from "../../domain/entities/payment.entity.js";
import { ValidationError } from "../../../../shared/error/validation-error.js";
import { NotFoundError } from "../../../../shared/error/not-found.js";

export class ConfirmPaymentUseCase {
    constructor({ paymentRepository, paystackService, createSubscriptionUseCase }) {
        this.paymentRepository = paymentRepository;
        this.paystackService = paystackService; // PaystackPaymentService
        this.createSubscriptionUseCase = createSubscriptionUseCase; // Injected CreateSubscriptionUseCase
    }

    async execute({ transactionId }) {
        if (!transactionId) throw new ValidationError("Transaction ID is required");

        // Find payment by transaction/reference
        const payments = await this.paymentRepository.findPayments({ transactionId });
        const payment = payments[0];
        if (!payment) throw new NotFoundError("Payment not found");

        // Verify with Paystack
        const paystackResult = await this.paystackService.verifyPayment(transactionId);

        // Update payment status in local DB
        if (paystackResult.status === "successful") {
            payment.markSuccessful();

            // ----------------------------
            // Create subscription if payment succeeded
            // ----------------------------
            await this.createSubscriptionUseCase.execute({
                accountId: payment.accountId,
                planId: payment.planId
            });

        } else if (paystackResult.status === "failed") {
            payment.markFailed();
        } else {
            payment.markPending();
        }

        return this.paymentRepository.updateStatus(payment.id, payment.status);
    }
}