// controllers/payment.controller.js
import { successResponse } from "../../../../shared/utils/response.util.js";

export class PaymentController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// ----------------------------
	// User: Create Payment (Paystack)
	// ----------------------------
	createPayment = async (req, res, next) => {
		try {
			const { planId, amount, monthsPaid } = req.body;
			const userId = req.user.id;

			const payment = await this.usecases.createPayment.execute({
				userId,
				planId,
				amount,
				monthsPaid
			});

			return successResponse({ res, data: payment, message: "Payment created successfully" });
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// User: Confirm Payment (Paystack callback)
	// ----------------------------
	confirmPayment = async (req, res, next) => {
		try {
			const { reference, status } = req.body;

			const updatedPayment = await this.usecases.confirmPayment.execute({
				transactionId: reference,
				status
			});

			return successResponse({ res, data: updatedPayment, message: "Payment confirmed successfully" });
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// User: Get my payments
	// ----------------------------
	getMyPayments = async (req, res, next) => {
		try {
			const userId = req.user.id;
			const { limit, skip } = req.query;

			const payments = await this.usecases.getMyPayments.execute({
				userId,
				limit: parseInt(limit) || 10,
				skip: parseInt(skip) || 0
			});

			return successResponse({ res, data: payments, message: "Payments fetched successfully" });
		} catch (err) {
			next(err);
		}
	};
}