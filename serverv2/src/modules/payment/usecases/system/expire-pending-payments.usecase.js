export class ExpirePendingPayments {
	constructor({ paymentRepository, paymentGatewayRegistry, processSuccessfulPayment }) {
		this.paymentRepository = paymentRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
	}

	async execute({ olderThanMinutes = 30 } = {}) {
		const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
		const stalePending = await this.paymentRepository.findExpiredPendingPayments(cutoff);

		let reconciled = 0;
		let expired = 0;
		const stillExpirable = [];

		for (const payment of stalePending) {
			try {
				const provider = this.paymentGatewayRegistry.get(payment.gateway);
				const result = await provider.verifyTransaction(payment.gatewayReference);

				if (result.status === "successful") {
					await this.processSuccessfulPayment.execute({ payment, gatewayData: { channel: result.raw?.channel } });
					reconciled++;
					continue;
				}
			} catch (err) {
				console.error(`[ExpirePendingPayments] Gateway check failed for ${payment.gatewayReference}:`, err.message);
			}

			stillExpirable.push(payment.id);
		}

		if (stillExpirable.length) {
			await this.paymentRepository.expirePayments(stillExpirable);
			expired = stillExpirable.length;
		}

		return { checked: stalePending.length, reconciled, expired };
	}
}