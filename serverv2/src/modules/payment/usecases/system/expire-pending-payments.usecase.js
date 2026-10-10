export class ExpirePendingPayments {
	constructor({ paymentRepository, paymentGatewayRegistry, processSuccessfulPayment }) {
		this.paymentRepository = paymentRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
	}

	async execute({ verifyAfterMinutes = 2, expireAfterMinutes = 30 } = {}) {
		const verifyCutoff = new Date(Date.now() - verifyAfterMinutes * 60 * 1000);
		const expireCutoff = new Date(Date.now() - expireAfterMinutes * 60 * 1000);
		const stale = await this.paymentRepository.findStalePayments(verifyCutoff);

		let reconciled = 0;
		const toExpire = [];

		for (const payment of stale) {
			try {
				const provider = this.paymentGatewayRegistry.get(payment.gateway);
				const result = await provider.verifyTransaction(payment.gatewayReference);

				if (result.status === "successful") {
					await this.processSuccessfulPayment.execute({ payment, gatewayData: { channel: result.raw?.channel } });
					reconciled++;
					continue;
				}
			} catch (error) {
				console.error(`[ExpirePendingPayments] Gateway check failed for ${payment.gatewayReference}:`, error.message);
			}

			if (new Date(payment.createdAt) <= expireCutoff) toExpire.push(payment.id);
		}

		if (toExpire.length) await this.paymentRepository.expirePayments(toExpire);

		return { checked: stale.length, reconciled, expired: toExpire.length };
	}
}