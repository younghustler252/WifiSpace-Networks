// subscription/presentation/controllers/admin.controller.js

import { successResponse } from "../../../../shared/utils/api-response.js";

export class SubscriptionAdminController {
	constructor({
		getAllSubscriptions,
		adminCreateSubscription,
		suspendSubscription,
		resumeSubscription,
		cancelSubscription,
		extendSubscription,
		forceExpireSubscription,
		adminRenewSubscription,       // Added Dependency
		changePlan
	}) {
		this.getAllSubscriptionsUseCase = getAllSubscriptions;
		this.adminCreateSubscriptionUseCase = adminCreateSubscription;
		this.suspendSubscriptionUseCase = suspendSubscription;
		this.resumeSubscriptionUseCase = resumeSubscription;
		this.cancelSubscriptionUseCase = cancelSubscription;
		this.extendSubscriptionUseCase = extendSubscription;
		this.forceExpireSubscriptionUseCase = forceExpireSubscription;
		this.adminRenewSubscriptionUseCase = adminRenewSubscription;             // Instantiated
		this.changePlanUseCase = changePlan;  
	}

	// ------------------------------------------------
	// GET ALL SUBSCRIPTIONS
	// ------------------------------------------------
	getAllSubscriptions = async (req, res) => {
		const {
			page = 1,
			limit = 20,
			autoRenewEnabled,
			...filters
		} = req.query;

		const result =
			await this.getAllSubscriptionsUseCase.execute({
				...filters,
				autoRenewEnabled:
					autoRenewEnabled === undefined
						? undefined
						: autoRenewEnabled === "true",

				page: Number(page),
				limit: Number(limit)
			});

		return successResponse({
			res,
			data: result,
			message: "Subscriptions retrieved",
			code: "SUBSCRIPTIONS_LIST",
			statusCode: 200
		});
	};

	// ------------------------------------------------
	// CREATE SUBSCRIPTION (ADMIN)
	// ------------------------------------------------
	createSubscription = async (req, res) => {
		const subscription =
			await this.adminCreateSubscriptionUseCase.execute({
				...req.body,
				adminId: req.user?.id
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription created successfully",
			code: "SUBSCRIPTION_CREATED",
			statusCode: 201
		});
	};

	adminRenewSubscription = async (req, res) => {
		const result = await this.adminRenewSubscriptionUseCase.execute({
			...req.body,
			adminId: req.user?.id
		});

		return successResponse({
			res,
			data: result,
			message: "Subscription renewed by admin successfully",
			code: "SUBSCRIPTION_RENEWED_BY_ADMIN",
			statusCode: 200
		});
	};

	// ------------------------------------------------
	// CHANGE SUBSCRIPTION PLAN (ADMIN OVERRIDE)
	// ------------------------------------------------
	adminChangePlan = async (req, res) => {
		const result = await this.changePlanUseCase.execute({
			accountId: req.body.accountId,
			newPlanId: req.body.newPlanId,
			reason: req.body.reason,
			paymentAdjustment: Number(req.body.paymentAdjustment || 0),
			adminId: req.user?.id
		});

		return successResponse({
			res,
			data: result,
			message: "Subscription plan changed by admin successfully",
			code: "SUBSCRIPTION_PLAN_CHANGED_BY_ADMIN",
			statusCode: 200
		});
	};

	// ------------------------------------------------
	// SUSPEND
	// ------------------------------------------------
	suspendSubscription = async (req, res) => {
		const { reason } = req.body;

		const subscription =
			await this.suspendSubscriptionUseCase.execute({
				subscriptionId: req.params.subscriptionId,
				reason,
				adminId: req.user?.id
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription suspended",
			code: "SUBSCRIPTION_SUSPENDED"
		});
	};

	// ------------------------------------------------
	// RESUME
	// ------------------------------------------------
	resumeSubscription = async (req, res) => {
		const subscription =
			await this.resumeSubscriptionUseCase.execute({
				subscriptionId: req.params.subscriptionId,
				adminId: req.user?.id
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription resumed",
			code: "SUBSCRIPTION_RESUMED"
		});
	};

	// ------------------------------------------------
	// CANCEL
	// ------------------------------------------------
	cancelSubscription = async (req, res) => {
		const { reason } = req.body;

		const subscription =
			await this.cancelSubscriptionUseCase.execute({
				subscriptionId: req.params.subscriptionId,
				reason,
				adminId: req.user?.id
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription canceled",
			code: "SUBSCRIPTION_CANCELED"
		});
	};

	// ------------------------------------------------
	// EXTEND SUBSCRIPTION
	// ------------------------------------------------
	extendSubscription = async (req, res) => {
		const { days, reason } = req.body;

		const subscription =
			await this.extendSubscriptionUseCase.execute({
				subscriptionId: req.params.subscriptionId,
				days,
				reason,
				adminId: req.user?.id
			});

		return successResponse({
			res,
			data: subscription,
			message: "Subscription extended",
			code: "SUBSCRIPTION_EXTENDED"
		});
	};

	// ------------------------------------------------
	// FORCE EXPIRE
	// ------------------------------------------------
		forceExpireSubscription = async (req, res) => {
			const { reason = "Admin forced lifecycle expiration" } = req.body || {};

			const subscription =
				await this.forceExpireSubscriptionUseCase.execute({
					subscriptionId: req.params.subscriptionId,
					reason,
					adminId: req.user?.id
				});

			return successResponse({
				res,
				data: subscription,
				message: "Subscription expired",
				code: "SUBSCRIPTION_FORCE_EXPIRED"
			});
		};

}