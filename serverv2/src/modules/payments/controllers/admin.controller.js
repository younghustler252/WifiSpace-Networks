// controllers/admin.controller.js
import { successResponse } from "../../../../shared/utils/response.util.js";

export class PaymentAdminController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// ----------------------------
	// Admin: Create Payment (for user via admin)
	// ----------------------------
	createPayment = async (req, res, next) => {
		try {
			const { userId, planId, amount, monthsPaid, method } = req.body;

			const payment = await this.usecases.adminCreatePayment.execute({
				userId,
				planId,
				amount,
				monthsPaid,
				method
			});

			return successResponse({ res, data: payment, message: "Payment created by admin successfully" });
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// Admin: Update Payment Status
	// ----------------------------
	updatePaymentStatus = async (req, res, next) => {
		try {
			const { paymentId, status } = req.body;

			const updatedPayment = await this.usecases.adminUpdatePaymentStatus.execute({
				paymentId,
				status
			});

			return successResponse({ res, data: updatedPayment, message: "Payment status updated successfully" });
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// Admin: Get Payments (all / filtered)
	// ----------------------------
	getPayments = async (req, res, next) => {
		try {
			const { userId, accountId, planId, status, startDate, endDate, limit, skip } = req.query;

			const payments = await this.usecases.getPayments.execute({
				userId,
				accountId,
				planId,
				status,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				limit: parseInt(limit) || 10,
				skip: parseInt(skip) || 0
			});

			return successResponse({ res, data: payments, message: "Payments fetched successfully" });
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// Shared: Get Payment by ID
	// ----------------------------
	getPaymentById = async (req, res, next) => {
		try {
			const { id } = req.params;

			const payment = await this.usecases.getPaymentById.execute({ paymentId: id });

			return successResponse({ res, data: payment, message: "Payment fetched successfully" });
		} catch (err) {
			next(err);
		}
	};
}