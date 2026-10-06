// modules/payment/controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ getAllPayments, getPaymentById, recordPayment, updatePaymentStatus }) {
		this.getAllPaymentsUseCase = getAllPayments;
		this.getPaymentByIdUseCase = getPaymentById;
		this.recordPaymentUseCase = recordPayment;
		this.updatePaymentStatusUseCase = updatePaymentStatus;
	}

	getAllPayments = async (req, res) => {
		const { data, meta } = await this.getAllPaymentsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((p) => p.toJSON()), meta, message: "Payments fetched successfully" });
	};

	// payment/controllers/admin.controller.js — getPaymentById updated
getPaymentById = async (req, res) => {
	const result = await this.getPaymentByIdUseCase.execute({ paymentId: req.params.id });
	return successResponse({ res, data: { payment: result.payment.toJSON(), router: result.router?.toJSON() ?? null }, message: "Payment fetched successfully" });
};	

	recordPayment = async (req, res) => {
		const result = await this.recordPaymentUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({
			res,
			data: { payment: result.payment.toJSON(), subscription: result.subscription?.toJSON() ?? null },
			message: "Payment recorded successfully",
			statusCode: 201
		});
	};

	updatePaymentStatus = async (req, res) => {
		const payment = await this.updatePaymentStatusUseCase.execute({ actorId: req.user.id, paymentId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: payment.toJSON(), message: "Payment status updated successfully" });
	};
}