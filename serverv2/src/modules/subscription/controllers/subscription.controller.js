import { successResponse } from "../../../shared/utils/api-response.js";

export class SubscriptionController {
	constructor({ subscribe, getMySubscriptions, getUpgradeOptions }) {
		this.subscribeUseCase = subscribe;
		this.getMySubscriptionsUseCase = getMySubscriptions;
		this.getUpgradeOptionsUseCase = getUpgradeOptions;
	}

	subscribe = async (req, res) => {
		const subscription = await this.subscribeUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription created successfully", statusCode: 201 });
	};

	getMySubscriptions = async (req, res) => {
		const subscriptions = await this.getMySubscriptionsUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: subscriptions.map((s) => s.toJSON()), message: "Subscriptions fetched successfully" });
	};

	getUpgradeOptions = async (req, res) => {
		const plans = await this.getUpgradeOptionsUseCase.execute({
			userId: req.user.id,
			accountId: req.query.accountId
		});
		return successResponse({ res, data: plans, message: "Upgrade options fetched successfully" });
	};
}
