// controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({
		adminCreateSubscription, getAllSubscriptions, getSubscriptionById,
		adminSuspendSubscription, adminResumeSubscription, cancelSubscription, extendSubscription,
		forceExpireSubscription, resyncSubscription
	}) {
		this.adminCreateSubscriptionUseCase = adminCreateSubscription;
		this.getAllSubscriptionsUseCase = getAllSubscriptions;
		this.getSubscriptionByIdUseCase = getSubscriptionById;
		this.adminSuspendSubscriptionUseCase = adminSuspendSubscription;
		this.adminResumeSubscriptionUseCase = adminResumeSubscription;
		this.cancelSubscriptionUseCase = cancelSubscription;
		this.extendSubscriptionUseCase = extendSubscription;
		this.forceExpireSubscriptionUseCase = forceExpireSubscription;
		this.resyncSubscriptionUseCase = resyncSubscription;
	}

	createSubscription = async (req, res) => {
		const subscription = await this.adminCreateSubscriptionUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription created successfully", statusCode: 201 });
	};

	getAllSubscriptions = async (req, res) => {
		const { data, meta } = await this.getAllSubscriptionsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((s) => s.toJSON()), meta, message: "Subscriptions fetched successfully" });
	};

	getSubscriptionById = async (req, res) => {
		const result = await this.getSubscriptionByIdUseCase.execute({ subscriptionId: req.params.id });
		return successResponse({
			res,
			data: {
				subscription: result.subscription.toJSON(),
				account: result.account?.toJSON() ?? null,
				router: result.router?.toJSON() ?? null,
				routers: result.routers ?? null
			},
			message: "Subscription fetched successfully"
		});
	};

	resync = async (req, res) => {
		const result = await this.resyncSubscriptionUseCase.execute({ actorId: req.user.id, subscriptionId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: result, message: result.success ? "Resynced successfully" : "Resync attempted, check result for details" });
	};

	suspendSubscription = async (req, res) => {
		const subscription = await this.adminSuspendSubscriptionUseCase.execute({ actorId: req.user.id, subscriptionId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription suspended successfully" });
	};

	resumeSubscription = async (req, res) => {
		const subscription = await this.adminResumeSubscriptionUseCase.execute({ actorId: req.user.id, subscriptionId: req.params.id, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription resumed successfully" });
	};

	cancelSubscription = async (req, res) => {
		const subscription = await this.cancelSubscriptionUseCase.execute({ actorId: req.user.id, subscriptionId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription canceled successfully" });
	};

	extendSubscription = async (req, res) => {
		const subscription = await this.extendSubscriptionUseCase.execute({ actorId: req.user.id, subscriptionId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription extended successfully" });
	};

	forceExpireSubscription = async (req, res) => {
		const subscription = await this.forceExpireSubscriptionUseCase.execute({
			actorId: req.user.id,
			subscriptionId: req.params.id,
			...req.body,
			ip: req.ip
		});
		return successResponse({ res, data: subscription.toJSON(), message: "Subscription force expired successfully" });
	};
}
