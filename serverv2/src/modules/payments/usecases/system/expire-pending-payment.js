import { Payment } from "../../domain/payment.entity.js";


export class ExpirePendingPaymentsUseCase {
    constructor({ paymentRepository }) {
        this.paymentRepository = paymentRepository;
    }

    // ==============================
    // EXPIRE PENDING PAYMENTS
    // ==============================
    async execute() {
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);

        const pendingPayments =
            await this.paymentRepository.findExpiredPendingPayments(cutoff);

        if (!pendingPayments.length) {
            return {
                expiredCount: 0
            };
        }

        await this.paymentRepository.expirePayments(
            pendingPayments.map(payment => payment.id)
        );

        return {
            expiredCount: pendingPayments.length
        };
    }
}