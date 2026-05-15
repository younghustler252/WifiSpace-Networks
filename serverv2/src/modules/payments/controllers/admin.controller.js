// controllers/admin.controller.js
import { successResponse } from "../../../shared/utils/api-response.js";

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
	// Shared: Get Payment by ID
	// ----------------------------
	
}