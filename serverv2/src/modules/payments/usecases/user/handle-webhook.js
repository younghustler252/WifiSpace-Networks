


export class HandleWebhookUseCase {
	constructor({ paymentService, confirmPayment }) { // CHANGED: was paystackPaymentService
		this.paymentService = paymentService;
		this.confirmPayment = confirmPayment;
	}

	async execute({ payload, signature, rawBody, gateway = "paystack" }) {
		const payment = await this.paymentService.handleWebhook({
			payload,
			signature,
			rawBody,
			gateway
		});

		if (!payment) return null;

	
		await this.confirmPayment.execute({
			reference: payment.gatewayReference
		});

		return payment;
	}
}