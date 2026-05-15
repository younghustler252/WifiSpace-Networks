// subscription/presentation/controllers/admin.controller.js

import { successResponse } from "../../../../shared/utils/api-response.js";

export class SubscriptionAdminController {

	constructor(usecases) {
		this.usecases = usecases;
	}

	// ------------------------------------------------
	// GET ALL SUBSCRIPTIONS
	// ------------------------------------------------
	getAllSubscriptions = async (req, res) => {

		const {
			page = 1,
			limit = 20,
			...filters
		} = req.query;

		const skip =
			(Number(page) - 1) * Number(limit);

		const data =
			await this.usecases
				.getAllSubscriptions
				.execute(filters);

		const total = data.length;

		const paginatedData =
			data.slice(
				skip,
				skip + Number(limit)
			);

		return successResponse({
			res,

			data: paginatedData,

			meta: {
				total,
				page: Number(page),
				limit: Number(limit),
				pages: Math.ceil(
					total / Number(limit)
				)
			},

			message:
				"Subscriptions retrieved",

			code: "SUBSCRIPTIONS_LIST",

			statusCode: 200
		});
	};

	// ------------------------------------------------
	// CREATE SUBSCRIPTION (ADMIN)
	// ------------------------------------------------
	createSubscription = async (req, res) => {

		const subscription =
			await this.usecases
				.adminCreateSubscription
				.execute({

					...req.body,

					adminId: req.user?.id
				});

		return successResponse({
			res,

			data: subscription,

			message:
				"Subscription created successfully",

			code:
				"SUBSCRIPTION_CREATED",

			statusCode: 201
		});
	};

	// ------------------------------------------------
	// SUSPEND
	// ------------------------------------------------
	suspendSubscription = async (req, res) => {
		const { reason } = req.body;

		const subscription =
			await this.usecases.suspendSubscription.execute({
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
		await this.usecases.resumeSubscription.execute({
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
	cancelSubscription = async (
		req,
		res
	) => {

		const { reason } = req.body;

		const subscription =
			await this.usecases
				.cancelSubscription
				.execute({

					subscriptionId:
						req.params.subscriptionId,

					reason,

					adminId:
						req.user?.id
				});

		return successResponse({
			res,

			data: subscription,

			message:
				"Subscription canceled",

			code:
				"SUBSCRIPTION_CANCELED"
		});
	};

	// ------------------------------------------------
	// EXTEND SUBSCRIPTION
	// ------------------------------------------------
	extendSubscription = async (
		req,
		res
	) => {

		const { days, reason } =
			req.body;

		const subscription =
			await this.usecases
				.extendSubscription
				.execute({

					subscriptionId:
						req.params.subscriptionId,

					days,

					reason,

					adminId:
						req.user?.id
				});

		return successResponse({
			res,

			data: subscription,

			message:
				"Subscription extended",

			code:
				"SUBSCRIPTION_EXTENDED"
		});
	};

	// ------------------------------------------------
	// FORCE EXPIRE
	// ------------------------------------------------
	forceExpireSubscription =
		async (req, res) => {

			const { reason } =
				req.body;

			const subscription =
				await this.usecases
					.forceExpireSubscription
					.execute({

						subscriptionId:
							req.params.subscriptionId,

						reason,

						adminId:
							req.user?.id
					});

			return successResponse({
				res,

				data: subscription,

				message:
					"Subscription expired",

				code:
					"SUBSCRIPTION_FORCE_EXPIRED"
			});
		};
}