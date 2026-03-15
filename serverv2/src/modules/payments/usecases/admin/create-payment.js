import { Payment } from "../../domain/entities/payment.entity.js";
import { ValidationError } from "../../../../shared/error/validation-error.js";
import { NotFoundError } from "../../../../shared/error/not-found.js";

export class ConfirmPaymentUseCase {
    constructor({ paymentRepository, paystackService, createSubscriptionUseCase, mikrotikService }) {
        this.paymentRepository = paymentRepository;             // PaymentRepositoryMongo
        this.paystackService = paystackService;                 // PaystackPaymentService
        this.createSubscriptionUseCase = createSubscriptionUseCase; // CreateSubscriptionUseCase
        this.mikrotikService = mikrotikService;                 // MikroTikService (PPPoE + Hotspot)
    }

    /**
     * Confirm a user's payment and provision subscription + PPPoE
     * @param {string} transactionId
     */
    async execute({ transactionId }) {
        if (!transactionId) throw new ValidationError("Transaction ID is required");

        // 1️⃣ Find payment by transaction
        const payments = await this.paymentRepository.findPayments({ transactionId });
        const payment = payments[0];
        if (!payment) throw new NotFoundError("Payment not found");

        // 2️⃣ Verify payment with Paystack
        const paystackResult = await this.paystackService.verifyPayment(transactionId);

        // 3️⃣ Update payment status
        if (paystackResult.status === "successful") {
            payment.markSuccessful();
            await this.paymentRepository.updateStatus(payment.id, payment.status);

            // 4️⃣ Create subscription
            const subscription = await this.createSubscriptionUseCase.execute({
                accountId: payment.accountId,
                planId: payment.planId
            });

            // 5️⃣ MikroTik provisioning (PPPoE)
            const account = payment.accountId; // Assuming payment.accountId points to Account object
            const wsId = account.wsnId;
            const password = account.pppoePassword || "defaultPass123"; // fallback password
            const profile = account.routerProfile || "default";

            // Check if MikroTik user already exists
            const existing = await this.mikrotikService.checkUserExists(wsId, account.serviceType);
            if (!existing) {
                await this.mikrotikService.createUser({
                    wsId,
                    password,
                    profile,
                    serviceType: account.serviceType
                });
            }

        } else if (paystackResult.status === "failed") {
            payment.markFailed();
            await this.paymentRepository.updateStatus(payment.id, payment.status);
        } else {
            payment.markPending();
            await this.paymentRepository.updateStatus(payment.id, payment.status);
        }

        return payment;
    }
}