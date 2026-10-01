// controllers/webhook.controller.js — no auth, no standard response envelope; gateways expect a bare 200
export class WebhookController {
	constructor({ handleWebhook }) {
		this.handleWebhookUseCase = handleWebhook;
	}

	paystack = async (req, res) => {
		await this.handleWebhookUseCase.execute({
			gateway: "paystack", rawBody: req.rawBody, signature: req.headers["x-paystack-signature"], payload: req.body
		});
		res.sendStatus(200); // always 200 to a verified-signature webhook, even for unrecognized/no-op events — gateways retry on non-2xx
	};
}