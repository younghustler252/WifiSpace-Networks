import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { Payment } from "../../domain/payment.entity.js";
import { PAYMENT_STATUSES } from "../../domain/payment.enum.js";

export class AdminUpdatePaymentStatusUseCase {
    constructor({ paymentRepository }) {
        this.paymentRepository = paymentRepository;
    }

    // ==============================
    // UPDATE PAYMENT STATUS
    // ==============================
    async execute({ paymentId, newStatus, adminNote = null }) {
        // -----------------------------
        // VALIDATION
        // -----------------------------
        if (!paymentId) throw new ValidationError("Payment ID is required");

        if (!newStatus || !PAYMENT_STATUSES.includes(newStatus)) {
            throw new ValidationError(`Invalid status: ${newStatus}`);
        }

        // -----------------------------
        // FETCH PAYMENT
        // -----------------------------
        const payment = await this.paymentRepository.findById(paymentId);

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        // -----------------------------
        // UPDATE STATUS
        // -----------------------------
        payment.status = newStatus;

        // update timestamps according to status
        if (newStatus === "successful") {
            payment.processed = true;
            payment.processedAt = new Date();
            payment.failedAt = null;
            payment.failureReason = null;
        } else if (newStatus === "failed") {
            payment.processed = false;
            payment.failedAt = new Date();
            if (!payment.failureReason) payment.failureReason = "Admin update";
        } else if (newStatus === "pending") {
            payment.processed = false;
            payment.failedAt = null;
            payment.processedAt = null;
            payment.failureReason = null;
        } else if (newStatus === "expired") {
            // optional: mark processed false for expired
            payment.processed = false;
        }

        // add admin note to metadata if provided
        if (adminNote) {
            payment.metadata = {
                ...payment.metadata,
                adminNote
            };
        }

        // -----------------------------
        // SAVE PAYMENT
        // -----------------------------
        const updatedPayment = await this.paymentRepository.update(payment);

        return updatedPayment;
    }
}