import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class ExpireSubscriptionsUseCase {
	constructor({
		subscriptionRepository,
		analyticsTracker,
		suspendNetworkAccount,
		mikrotikService,
		accountRepository,
		routerRepository
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.analyticsTracker = analyticsTracker;
		this.suspendNetworkAccount = suspendNetworkAccount;
		this.mikrotikService = mikrotikService;
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
	}

	async execute({ subscriptionId, context = {} }) {
		if (!subscriptionId) throw new ValidationError("subscriptionId is required");

		const rawSub = await this.subscriptionRepository.findById(subscriptionId);
		if (!rawSub) throw new NotFoundError("Subscription not found");

		const subscription = new Subscription(rawSub);
		const isForceExpire = context?.isForceExpire === true;

		if (subscription.isAlreadyFinalized() && subscription.mikrotikStatus === "synced") {
			return subscription;
		}

		if (!isForceExpire && !subscription.isPastExpiry()) {
			return subscription;
		}

		subscription.expire();

		if (subscription.accountId) {
			try {
				await this.suspendNetworkAccount.execute(
					subscription.accountId,
					"Subscription Expired",
					context
				);

				if (subscription.planSnapshot?.serviceType === "hotspot" && this.mikrotikService) {
					const account = await this.accountRepository.findById(subscription.accountId);
					if (account && account.routerId) {
						const router = await this.routerRepository.findById(account.routerId);
						if (router) {
							await this.mikrotikService.disconnectAccount(account, router);
						}
					}
				}

				subscription.mikrotikStatus = "synced";
				subscription.mikrotikError = null;
				subscription.mikrotikLastSyncAt = new Date();

			} catch (routerError) {
				subscription.mikrotikStatus = "failed";
				subscription.mikrotikError = routerError.message;
				subscription.mikrotikLastSyncAt = new Date();

				await this.subscriptionRepository.save(subscription);
				throw routerError;
			}
		}

		await this.subscriptionRepository.save(subscription);

		this.analyticsTracker.track(
			ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
			{ accountId: subscription.accountId, subscriptionId: subscription.id }
		).catch((err) => console.error("Analytics failed:", err.message));

		return subscription;
	}
}
