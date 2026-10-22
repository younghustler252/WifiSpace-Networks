// payment/usecases/admin/reverse-payment.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { toKobo } from "../../../../shared/utils/money.js";
import { WALLET_TX_TYPES, WALLET_TX_SOURCES } from "../../../wallet/domain/wallet.enum.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class ReversePayment {
	constructor({ paymentRepository, walletRepository, auditService }) {
		this.paymentRepository = paymentRepository;
		this.walletRepository = walletRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, paymentId, reason, ip = null }) {
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);
		if (!payment.isSuccessful()) throw new ValidationError("Only a successful payment can be reversed");

		const amountKobo = toKobo(payment.totalAmount);

		if (amountKobo > 0) {
			await this.walletRepository.apply({
				userId: payment.userId,
				type: WALLET_TX_TYPES.CREDIT,
				amountKobo,
				source: WALLET_TX_SOURCES.REVERSAL,
				reference: `reversal:${payment.id}`,
				description: reason ? `Refund: ${reason}` : "Payment reversed",
				metadata: { paymentId: payment.id, actorId }
			});
		}

		payment.markRefunded(reason);
		const updated = await this.paymentRepository.update(payment.id, payment);

		await this.auditService?.log({ actorId, action: "PAYMENT_REVERSED", entity: "Payment", entityId: paymentId, newValue: { reason, creditedToWalletKobo: amountKobo }, ip });

		return updated;
	}
}