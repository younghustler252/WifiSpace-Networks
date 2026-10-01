import axios from "axios";
import crypto from "crypto";
import { AppError } from "../../../shared/errors/domain.errors.js";
import { PaymentGatewayInterface } from "../payment-gateway.interface.js";
import { PAYMENT_STATUSES } from "../../../modules/payment/domain/payment.enum.js";

export class PaystackProvider extends PaymentGatewayInterface {
	constructor({ paystackSecretKey }) {
		super();
		this.secretKey = paystackSecretKey;
		this.client = axios.create({
			baseURL: "https://api.paystack.co",
			headers: { Authorization: `Bearer ${this.secretKey}`, "Content-Type": "application/json" },
			timeout: 15000
		});
	}

	async initializeTransaction({ email, amount, reference, metadata = {}, callbackUrl }) {
		try {
			if (!email) throw new AppError("Email is required", 400);
			if (!amount || amount <= 0) throw new AppError("Invalid amount", 400);

			const response = await this.client.post("/transaction/initialize", {
				email, amount: Math.round(amount * 100), reference, metadata, callback_url: callbackUrl
			});
			return response.data;
		} catch (err) {
			this._handleAxiosError(err, "PAYSTACK_INIT_ERROR", "Failed to initialize Paystack transaction");
		}
	}

	async verifyTransaction(reference) {
		try {
			if (!reference) throw new AppError("Reference is required", 400);
			const response = await this.client.get(`/transaction/verify/${reference}`);
			return { reference, status: this.mapStatus(response.data.data.status), raw: response.data.data };
		} catch (err) {
			this._handleAxiosError(err, "PAYSTACK_VERIFY_ERROR", "Failed to verify Paystack transaction");
		}
	}

	verifyWebhookSignature(rawBody, signature) {
		try {
			if (!signature || !rawBody) return false;
			const hash = crypto.createHmac("sha512", this.secretKey).update(rawBody).digest("hex");
			return hash === signature;
		} catch {
			return false;
		}
	}

	parseWebhookEvent(payload) {
		const event = payload?.event;
		const data = payload?.data || {};
		let status;
		if (event === "charge.success") status = PAYMENT_STATUSES.SUCCESSFUL;
		else if (event === "charge.failed") status = PAYMENT_STATUSES.FAILED;
		else return null;

		return { reference: data.reference, status, amountKobo: data.amount, channel: data.channel || null, authorization: data.authorization || null };
	}

	mapStatus(status) {
		if (status === "success") return PAYMENT_STATUSES.SUCCESSFUL;
		if (status === "failed" || status === "abandoned") return PAYMENT_STATUSES.FAILED;
		return PAYMENT_STATUSES.PENDING;
	}

	_handleAxiosError(err, code, message) {
		if (err.response) throw new AppError(message, err.response.status || 500, code, err.response.data);
		if (err.request) throw new AppError("No response from Paystack API", 503, code, err.message);
		throw new AppError(message, 500, code, err.message);
	}
}