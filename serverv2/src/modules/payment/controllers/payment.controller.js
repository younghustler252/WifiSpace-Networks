import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class PaymentController {
	constructor({ initiatePayment, verifyPayment, getMyPayments }) {
		this.initiatePaymentUseCase = initiatePayment;
		this.verifyPaymentUseCase = verifyPayment;
		this.getMyPaymentsUseCase = getMyPayments;
	}

	initiatePayment = async (req, res) => {
		const result = await this.initiatePaymentUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: { payment: result.payment.toJSON(), authorizationUrl: result.authorizationUrl, reference: result.reference }, message: "Payment initiated", statusCode: 201 });
	};

	verifyPayment = async (req, res) => {
		const result = await this.verifyPaymentUseCase.execute({ userId: req.user.id, reference: req.params.reference });
		return successResponse({ res, data: { status: result.status, payment: result.payment.toJSON() }, message: "Payment status checked" });
	};

	getMyPayments = async (req, res) => {
		const payments = await this.getMyPaymentsUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: payments.map((p) => p.toJSON()), message: "Payments fetched successfully" });
	};
}