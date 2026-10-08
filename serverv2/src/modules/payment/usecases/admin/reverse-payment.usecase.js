// payment/usecases/admin/reverse-payment.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class ReversePayment {
	constructor({ paymentRepository, auditService }) {
		this.paymentRepository = paymentRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, paymentId, reason, ip = null }) {
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);
		if (!payment.isSuccessful()) throw new ValidationError("Only a successful payment can be reversed");

		payment.markRefunded(reason);
		const updated = await this.paymentRepository.update(payment.id, payment);

		await this.auditService?.log({ actorId, action: "PAYMENT_REVERSED", entity: "Payment", entityId: paymentId, newValue: { reason }, ip });

		return updated;
	}
}