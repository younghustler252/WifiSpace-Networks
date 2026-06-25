export class ServiceActivationService {

	constructor({
		hotspotActivator,
		pppoeActivator
	}) {
		this.hotspotActivator = hotspotActivator;
		this.pppoeActivator = pppoeActivator;
	}

	// =====================================================
	// MAIN ENTRY
	// =====================================================
	async activate({
		account,
		user,
		plan,
		subscription,
		metadata = {}
	}) {

		if (!account) {
			throw new Error("Account is required");
		}

		if (!plan) {
			throw new Error("Plan is required");
		}

		if (!subscription) {
			throw new Error("Subscription is required");
		}

		const serviceType = plan.serviceType;

		// =====================================================
		// ROUTE BY SERVICE TYPE
		// =====================================================
		switch (serviceType) {

			// -----------------------------
			// HOTSPOT SERVICE
			// -----------------------------
			case "hotspot":

				return await this.hotspotActivator.activate({
					account,
					user,
					plan,
					subscription,
					metadata
				});

			// -----------------------------
			// PPPoE SERVICE
			// -----------------------------
			case "pppoe":

				return await this.pppoeActivator.activate({
					account,
					user,
					plan,
					subscription,
					metadata
				});

			// -----------------------------
			// UNKNOWN SERVICE
			// -----------------------------
			default:
				throw new Error(
					`Unknown service type: ${serviceType}`
				);
		}
	}
}