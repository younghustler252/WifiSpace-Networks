import { successResponse } from "../../../shared/utils/api-response.js";

export class SubscriptionController {
	constructor({ subscribe, getMySubscriptions, getUpgradeOptions, initiatePlanChange }) {
		this.initiatePlanChangeUseCase = initiatePlanChange;
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

	changePlan = async (req, res) => {
		const result = await this.initiatePlanChangeUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({
			res,
			data: { ...result, payment: result.payment?.toJSON?.() ?? result.payment },
			message: result.paidWith === "wallet" ? "Upgrade paid from wallet" : "Upgrade checkout started",
			statusCode: 201
		});
	};

	getUpgradeOptions = async (req, res) => {
		const plans = await this.getUpgradeOptionsUseCase.execute({
			userId: req.user.id,
			accountId: req.query.accountId
		});
		return successResponse({ res, data: plans, message: "Upgrade options fetched successfully" });
	};
}
