import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class ResyncSubscription {
	constructor({ subscriptionRepository, accountRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, routerId = null, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		const account = await this.accountRepository.findById(subscription.accountId);
		if (account?.serviceType === SERVICE_TYPES.HOTSPOT && !routerId) {
			throw new ValidationError("routerId is required to resync a hotspot subscription");
		}

		const result = await this.networkService.activate(subscription, routerId ? { routerId } : {});

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "SUBSCRIPTION_RESYNCED", entity: "Subscription", entityId: subscriptionId, newValue: { success: result.success, routerId }, ip });
		}

		return result.provisioning;
	}
}
