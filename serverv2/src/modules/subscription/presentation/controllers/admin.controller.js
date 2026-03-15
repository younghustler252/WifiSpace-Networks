// subscription/presentation/controllers/admin.controller.js
import { successResponse } from "../../../../shared/utils/api-response.js";

export class SubscriptionAdminController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// Get all subscriptions with optional filter & pagination
	getAllSubscriptions = async (req, res) => {
		const { page = 1, limit = 20, ...filters } = req.query;

		const skip = (Number(page) - 1) * Number(limit);

		const data = await this.usecases.getAllSubscriptions.execute(filters);

		const total = data.length;

		const paginatedData = data.slice(skip, skip + Number(limit));

		return successResponse({
			res,
			data: paginatedData,
			message: "Subscriptions retrieved",
			code: "SUBSCRIPTIONS_LIST",
			statusCode: 200
		});
	};

	suspendSubscription = async (req, res) => {
		const subscription = await this.usecases.suspendSubscription.execute(req.params.subscriptionId);
		return successResponse({ res, data: subscription, message: "Subscription suspended" });
	};

	resumeSubscription = async (req, res) => {
		const subscription = await this.usecases.resumeSubscription.execute(req.params.subscriptionId);
		return successResponse({ res, data: subscription, message: "Subscription resumed" });
	};

	cancelSubscription = async (req, res) => {
		const subscription = await this.usecases.cancelSubscription.execute(req.params.subscriptionId);
		return successResponse({ res, data: subscription, message: "Subscription canceled" });
	};
}