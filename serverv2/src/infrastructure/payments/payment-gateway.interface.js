export class PaymentGatewayInterface {
	async initializeTransaction({ email, amount, reference, metadata, callbackUrl }) {
		throw new Error("Method 'initializeTransaction()' must be implemented.");
	}
	async verifyTransaction(reference) {
		throw new Error("Method 'verifyTransaction()' must be implemented.");
	}
	verifyWebhookSignature(rawBody, signature) {
		throw new Error("Method 'verifyWebhookSignature()' must be implemented.");
	}
	parseWebhookEvent(payload) {
		throw new Error("Method 'parseWebhookEvent()' must be implemented.");
	}
	mapStatus(providerStatus) {
		throw new Error("Method 'mapStatus()' must be implemented.");
	}
}	