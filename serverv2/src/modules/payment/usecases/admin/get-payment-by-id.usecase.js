// payment/usecases/admin/get-payment-by-id.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class GetPaymentById {
	constructor({ paymentRepository, routerRepository }) {
		this.paymentRepository = paymentRepository;
		this.routerRepository = routerRepository;
	}

	async execute({ paymentId }) {
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);

		const routerId = payment.metadata?.provisioning?.routerId;
		const router = routerId ? await this.routerRepository.findById(routerId) : null;

		return { payment, router };
	}
}