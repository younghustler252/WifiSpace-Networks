// subscription/usecases/admin/get-subscription-by-id.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class GetSubscriptionById {
	constructor({ subscriptionRepository, accountRepository, routerRepository, routerProvisioningRepository }) {
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async execute({ subscriptionId }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		const account = await this.accountRepository.findById(subscription.accountId);

		let router = null;
		let routers = null;

		if (account?.serviceType === SERVICE_TYPES.PPPOE && account.routerId) {
			router = await this.routerRepository.findById(account.routerId);
		} else if (account?.serviceType === SERVICE_TYPES.HOTSPOT) {
			const provisionings = await this.routerProvisioningRepository.findByAccount(account.id, { status: "synced" });
			routers = provisionings.map((p) => p.routerId);
		}

		return { subscription, account, router, routers };
	}
}