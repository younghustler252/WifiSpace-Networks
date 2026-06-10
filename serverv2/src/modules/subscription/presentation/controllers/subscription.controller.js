// subscription/presentation/controllers/subscription.controller.js

import { successResponse }
	from "../../../../shared/utils/api-response.js";

export class SubscriptionController {

	constructor({

		createSubscription,
		renewSubscription,
		upgradeSubscription,

		getSubscription,
		getAccountSubscriptions,
		getCurrentSubscription,

	}) {

		this.createSubscriptionUseCase =
			createSubscription;

		this.renewSubscriptionUseCase =
			renewSubscription;

		this.upgradeSubscriptionUseCase =
			upgradeSubscription;

		this.getSubscriptionUseCase =
			getSubscription;

		this.getAccountSubscriptionsUseCase =
			getAccountSubscriptions;

		this.getCurrentSubscriptionUseCase =
			getCurrentSubscription;
	}

	// ==================================================
	// ACCOUNT
	// ==================================================

	createSubscription = async (req, res) => {

		const subscription =
			await this.createSubscriptionUseCase.execute(req.body);

		return successResponse({
			res,
			data: subscription,
			message: "Subscription created"
		});
	};

	renewSubscription = async (req, res) => {

		const { subscriptionId } = req.params;

		const subscription =
			await this.renewSubscriptionUseCase.execute({

				subscriptionId,

				paymentId: req.body?.paymentId,

				cycles: req.body?.cycles,

				context: {
					ip: req.ip,
					userAgent: req.headers["user-agent"],
					userId: req.user?.id
				}
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription renewed"
		});
	};

	upgradeSubscription = async (req, res) => {

		const subscription =
			await this.upgradeSubscriptionUseCase.execute(
				req.params.subscriptionId,
				req.body
			);

		return successResponse({
			res,
			data: subscription,
			message: "Subscription upgraded"
		});
	};

	// ==================================================
	// SHARED
	// ==================================================

	getSubscription = async (req, res) => {

		const subscription =
			await this.getSubscriptionUseCase.execute(
				req.params.subscriptionId
			);

		return successResponse({
			res,
			data: subscription
		});
	};

	getAccountSubscriptions = async (req, res) => {

		const subscriptions =
			await this.getAccountSubscriptionsUseCase.execute(
				req.params.accountId
			);

		return successResponse({
			res,
			data: subscriptions
		});
	};

	getCurrentSubscription = async (req, res) => {

		const subscription =
			await this.getCurrentSubscriptionUseCase.execute({
				accountId: req.params.accountId
			});

		return successResponse({
			res,
			data: subscription
		});
	};

}