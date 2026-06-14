import { successResponse } from "../../../shared/utils/api-response.js";

export class PaymentController {
	constructor({
		createPayment,
		confirmPayment,
		reprocessPayment,
		resolvePayment,
		getPayments,
		getPaymentById,
		handleWebhook
	}) {
		this.createPaymentUseCase = createPayment;
		this.confirmPaymentUseCase = confirmPayment;
		this.getPaymentsUseCase = getPayments;
		this.getPaymentByIdUseCase = getPaymentById;
		this.handleWebhookUseCase = handleWebhook;
		this.reprocessPaymentUseCase = reprocessPayment;
		this.resolvePaymentUseCase = resolvePayment;
	}

	// ----------------------------
	// CREATE PAYMENT
	// ----------------------------
		createPayment = async (req, res, next) => {
			try {
				const {
					userId,
					accountId,
					planId,
					cycles,
					actionType,
					subscriptionId,
					paymentChannel
				} = req.body;

				const user = req.user;
				const payment =
					await this.createPaymentUseCase.execute({
						userId:
							user.id ,

						email: user.email,

						accountId,

						planId,

						subscriptionId,

						cycles,

						actionType,

						paymentChannel
					});

				return successResponse({
					res,
					data: payment,
					message:
						"Payment created successfully"
				});
			} catch (err) {
				next(err);
			}
		};
	// ----------------------------
	// CONFIRM PAYMENT
	// ----------------------------
	confirmPayment = async (req, res, next) => {
		try {
			const { reference } = req.body;

			const {
				payment
			} = await this.confirmPaymentUseCase.execute({
				reference
			});

			return successResponse({
				res,
				data: payment,
				message: "Payment confirmed successfully"
			});
		} catch (err) {
			next(err);
		}
	};

	reprocessPayment = async (req, res, next) => {
		try {
			const { paymentId } = req.params;

			// console.log("🔁 REPROCESS PAYMENT START:", {
			// 	paymentId,
			// 	adminId: req.user?.id
			// });

			const result =
				await this.reprocessPaymentUseCase.execute({
					paymentId
				});

			// console.log("✅ REPROCESS PAYMENT SUCCESS:", {
			// 	paymentId,
			// 	alreadyProcessed: result.alreadyProcessed
			// });

			return successResponse({
				res,
				data: result.payment,
				message: result.alreadyProcessed
					? "Payment already processed"
					: "Payment reprocessed successfully"
			});

		} catch (err) {

			console.error("❌ REPROCESS PAYMENT ERROR:", err);

			next(err);
		}
	};


	// ----------------------------
	// GET PAYMENTS
	// ----------------------------
	getPayments = async (req, res, next) => {
		try {
			const {
				accountId,
				status,
				gateway,
				search,
				paymentChannel,
				actionType,
				businessProcessed,
				isWebhookProcessed,
				fromDate,
				toDate,
				skip,
				limit,
				sort
			} = req.query;

			// console.log("QUERY RECEIVED:", req.query);

			const paymentsResult = await this.getPaymentsUseCase.execute(
				req.user,
				{
					accountId,
					status,
					gateway,
					paymentChannel,
					search,
					actionType,
					businessProcessed: businessProcessed === "true"
						? true
						: businessProcessed === "false"
						? false
						: undefined,
					isWebhookProcessed: isWebhookProcessed === "true"
						? true
						: isWebhookProcessed === "false"
						? false
						: undefined,
					createdAfter: fromDate,
					createdBefore: toDate,
					skip: Number(skip) || 0,
					limit: Number(limit) || 50,
					sort
				}
			);

			// paymentsResult has { data, pagination }
			return successResponse({
				res,
				data: paymentsResult,
				message: "Payments fetched successfully"
			});

		} catch (err) {
			next(err);
		}
	};
	// ----------------------------
	// GET PAYMENT BY ID
	// ----------------------------
	getPaymentById = async (req, res, next) => {
		try {
			const { id } = req.params;

			const payment = await this.getPaymentByIdUseCase.execute({
				id,
				userRole: req.user.role,
				userId: req.user.id
			});

			return successResponse({
				res,
				data: payment,
				message: "Payment fetched successfully"
			});
		} catch (err) {
			next(err);
		}
	};

	// ----------------------------
	// WEBHOOK
	// ----------------------------
	handleWebhook = async (req, res, next) => {
		try {
			const signature = req.headers["x-paystack-signature"];
			const payload = req.body;
			const rawBody = req.rawBody;

			await this.handleWebhookUseCase.execute({
				payload,
				signature,
				rawBody
			});
			// 🔥 ALWAYS return 200 to stop Paystack retries
			return res.status(200).send("OK");

		} catch (err) {
			next(err);
		}
	};

	resolvePayment = async (req, res, next) => {
		try {

			const { reference } = req.query;

			const result =
				await this.resolvePaymentUseCase
					.execute({
						reference
					});

			return successResponse({
				res,
				data: result,
				message: "Payment resolved successfully"
			});

		} catch (err) {
			next(err);
		}
	};
}

