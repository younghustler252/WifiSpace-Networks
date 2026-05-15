export class HandleWebhookUseCase {
	constructor({ paystackPaymentService, confirmPaymentUseCase }) {
		this.paystackPaymentService = paystackPaymentService;
		this.confirmPaymentUseCase = confirmPaymentUseCase;
	}

	async execute({ payload, signature }) {
		// verify signature + basic parsing
		const payment =
			await this.paystackPaymentService.handleWebhook({
				payload,
				signature
			});

		if (!payment) return null;

		// ONLY process successful payments
		if (payment.status === "successful") {
			await this.confirmPaymentUseCase.execute({
				transactionId: payment.transactionId
			});
		}

		return payment;
	}
}