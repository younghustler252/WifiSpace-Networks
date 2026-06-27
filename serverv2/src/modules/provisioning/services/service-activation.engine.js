import { ValidationError } from "../../../shared/errors/validation-error.js";

export class ServiceActivationService {
	constructor({ hotspotActivator }) {
		this.hotspotActivator = hotspotActivator;
	}

	async activate({ account, user, plan, subscription, metadata = {} }) {
		if (!account) throw new ValidationError("Account is required");
		if (!plan) throw new ValidationError("Plan is required");
		if (!subscription) throw new ValidationError("Subscription is required");

		if (plan.serviceType !== "hotspot") {
			// Ignore completely. PPPoE is managed non-blockingly by BullMQ queues.
			return { success: true, message: "Skipped inline activation for non-hotspot tier" };
		}

		return await this.hotspotActivator.activate({
			account,
			user,
			plan,
			subscription,
			metadata
		});
	}
}
