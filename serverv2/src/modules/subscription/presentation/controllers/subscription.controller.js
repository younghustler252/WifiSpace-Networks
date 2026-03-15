// subscription/presentation/controllers/subscription.controller.js
import { successResponse } from "../../../../shared/utils/api-response.js";

export class SubscriptionController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// -----------------------------
	// Account Usecases
	// -----------------------------
	createSubscription = async (req, res) => {
		const subscription = await this.usecases.createSubscription.execute(req.body);
		return successResponse({ res, data: subscription, message: "Subscription created" });
	};

	renewSubscription = async (req, res) => {
		const subscription = await this.usecases.renewSubscription.execute(req.params.subscriptionId);
		return successResponse({ res, data: subscription, message: "Subscription renewed" });
	};

	upgradeSubscription = async (req, res) => {
		const subscription = await this.usecases.upgradeSubscription.execute(
			req.params.subscriptionId,
			req.body
		);
		return successResponse({ res, data: subscription, message: "Subscription upgraded" });
	};

	// -----------------------------
	// Shared Usecases
	// -----------------------------
	getSubscription = async (req, res) => {
		const subscription = await this.usecases.getSubscription.execute(req.params.subscriptionId);
		return successResponse({ res, data: subscription });
	};

	getAccountSubscriptions = async (req, res) => {
		const subscriptions = await this.usecases.getAccountSubscriptions.execute(req.params.accountId);
		return successResponse({ res, data: subscriptions });
	};

	getActiveSubscription = async (req, res) => {
		const subscription = await this.usecases.getActiveSubscription.execute(req.params.accountId);
		return successResponse({ res, data: subscription });
	};

	getUserSubscriptions = async (req, res) => {
		const subscriptions = await this.usecases.getUserSubscriptions.execute(req.params.userId);
		return successResponse({ res, data: subscriptions });
	};
}