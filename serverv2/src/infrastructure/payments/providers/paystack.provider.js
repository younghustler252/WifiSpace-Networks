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

	async createVirtualAccount({ email, firstName, lastName, phone }) {
		try {
			const customerResponse = await this.client.post("/customer", { email, first_name: firstName, last_name: lastName, phone });
			const customerCode = customerResponse.data.data.customer_code;

			const accountResponse = await this.client.post("/dedicated_account", {
				customer: customerCode,
				preferred_bank: process.env.PAYSTACK_DVA_BANK || "wema-bank"
			});
			const account = accountResponse.data.data;

			return {
				accountNumber: account.account_number,
				bankName: account.bank?.name ?? null,
				accountName: account.account_name ?? null,
				customerCode
			};
		} catch (err) {
			this._handleAxiosError(err, "PAYSTACK_DVA_ERROR", "Failed to create dedicated account");
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
		if (event === "charge.success" && data.channel === "dedicated_nuban") {
			return {
				kind: "wallet_funding",
				reference: data.reference,
				status: PAYMENT_STATUSES.SUCCESSFUL,
				amountKobo: data.amount,
				accountNumber: data.authorization?.receiver_bank_account_number ?? null,
				customerCode: data.customer?.customer_code ?? null,
				senderName: data.authorization?.sender_name ?? null
			};
		}

		let status;
		if (event === "charge.success") status = PAYMENT_STATUSES.SUCCESSFUL;
		else if (event === "charge.failed") status = PAYMENT_STATUSES.FAILED;
		else return null;

		return { kind: "payment", reference: data.reference, status, amountKobo: data.amount, channel: data.channel || null, authorization: data.authorization || null };
	}

	mapStatus(status) {
		if (status === "success") return PAYMENT_STATUSES.SUCCESSFUL;
		if (status === "failed") return PAYMENT_STATUSES.FAILED;
		return PAYMENT_STATUSES.PENDING;
	}

	_handleAxiosError(err, code, message) {
		if (err.response) throw new AppError(message, err.response.status || 500, code, err.response.data);
		if (err.request) throw new AppError("No response from Paystack API", 503, code, err.message);
		throw new AppError(message, 500, code, err.message);
	}
}