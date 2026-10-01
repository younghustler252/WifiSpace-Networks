import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES, PAYMENT_STATUSES } from "../../domain/payment.enum.js";

export class UpdatePaymentStatus {
	constructor({ paymentRepository, processSuccessfulPayment, auditService }) {
		this.paymentRepository = paymentRepository;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.auditService = auditService;
	}

	async execute({ actorId, paymentId, status, reason = null, ip = null }) {
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);

		if (payment.isSuccessful() && status !== PAYMENT_STATUSES.SUCCESSFUL) {
			throw new ValidationError("Cannot change status of an already-successful payment");
		}

		if (status === PAYMENT_STATUSES.SUCCESSFUL) {
			const result = await this.processSuccessfulPayment.execute({ payment, gatewayData: { manuallyConfirmedBy: actorId } });

			if (this.auditService) {
				await this.auditService.log({
					actorId, action: "PAYMENT_STATUS_UPDATED", entity: "Payment", entityId: payment.id,
					newValue: { status: PAYMENT_STATUSES.SUCCESSFUL, reason }, ip
				});
			}

			return result.payment;
		}

		if (status === PAYMENT_STATUSES.FAILED) {
			payment.markFailed(reason || "Manually marked as failed by admin");
		} else if (status === PAYMENT_STATUSES.EXPIRED) {
			payment.markExpired();
		} else {
			throw new ValidationError("Unsupported status transition");
		}

		const updated = await this.paymentRepository.update(payment.id, payment);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "PAYMENT_STATUS_UPDATED", entity: "Payment", entityId: payment.id,
				newValue: { status, reason }, ip
			});
		}

		return updated;
	}
}