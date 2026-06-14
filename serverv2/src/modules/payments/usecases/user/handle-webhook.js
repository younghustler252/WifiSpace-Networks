export class HandleWebhookUseCase {
	constructor({ paystackPaymentService, confirmPayment }) {
		this.paystackPaymentService = paystackPaymentService;
		this.confirmPayment = confirmPayment;
	}

  	async execute({ payload, signature, rawBody }) {
		// 🔥 delegate ALL webhook handling to service
		const payment = await this.paystackPaymentService.handleWebhook({
			payload,
			signature,
			rawBody
		});

		if (!payment) return null;

		// optional extra business logic
		await this.confirmPayment.execute({
			reference: payment.gatewayReference
		});

		return payment;
	}
}