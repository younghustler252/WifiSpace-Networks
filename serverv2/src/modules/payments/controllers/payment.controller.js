// controllers/payment.controller.js
import { successResponse } from "../../../shared/utils/api-response.js";

export class PaymentController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// ----------------------------
	// User: Create Payment (Paystack)
	// ----------------------------
	createPayment = async (req, res, next) => {
		try {
			const { accountId, planId, cycles } = req.body;
			const user = req.user;

			const payment = await this.usecases.createPayment.execute({
				userId: user.id,
				accountId,
				planId,
				cycles,
			});

			return successResponse({
				res,
				data: payment,
				message: "Payment created successfully",
			});
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// User: Confirm Payment (Paystack callback)
	// ----------------------------
	confirmPayment = async (req, res, next) => {
	try {
		const { transactionId } = req.body;

		const updatedPayment =
			await this.usecases.confirmPayment.execute({
				transactionId
			});

		return successResponse({
			res,
			data: updatedPayment,
			message: "Payment confirmed successfully"
		});
	} catch (err) {
		next(err);
	}
};
	// ----------------------------
	// User: Get my payments
	// ----------------------------
	getPayments = async (req, res, next) => {
	try {
		const {
			planId,
			status,
			fromDate,
			toDate,
			page,
			limit,
			sortField,
			sortOrder
		} = req.query;

		const payments =
			await this.usecases.getPayments.execute({
				userRole: req.user.role,

				authenticatedUserId: req.user.id,

				accountId:
					req.user.role === "customer"
						? req.user.accountId
						: req.query.accountId,

				filters: {
					planId,
					status,
					fromDate,
					toDate,

					// only allow admin filters safely
					userId:
						req.user.role === "admin"
							? req.query.userId
							: undefined,

					accountId:
						req.user.role === "admin"
							? req.query.accountId
							: undefined
				},

				pagination: {
					page: parseInt(page) || 1,
					limit: parseInt(limit) || 10
				},

				sort: {
					field: sortField,
					order: sortOrder || "desc"
				}
			});

		return successResponse({
			res,
			data: payments,
			message: "Payments fetched successfully"
		});
	} catch (err) {
		next(err);
	}
};
	getPaymentById = async (req, res, next) => {
		try {
			const { id } = req.params;

			const payment = await this.usecases.getPaymentById.execute({ paymentId: id });

			return successResponse({ res, data: payment, message: "Payment fetched successfully" });
		} catch (err) {
			next(err);
		}
	};

	handleWebhook = async (req, res, next) => {
		try {
			const signature = req.headers["x-paystack-signature"];
			const payload = req.body;

			// verify + extract reference
			await this.usecases.handleWebhook.execute({
				payload,
				signature
			});

			// respond fast (VERY IMPORTANT)
			return res.status(200).send("OK");
		} catch (err) {
			next(err);
		}
	};

}