// src/infrastructure/external/paystack/paystack.gateway.js
import axios from "axios";
import crypto from "crypto";
import { AppError } from "../../../../shared/errors/app-error.js";

export class PaystackGateway {
	constructor({ paystackSecretKey }) {
		this.secretKey = paystackSecretKey;

		this.client = axios.create({
			baseURL: "https://api.paystack.co",
			headers: {
				Authorization: `Bearer ${this.secretKey}`,
				"Content-Type": "application/json"
			},
			timeout: 15000
		});
	}

	// =========================
	// INIT TRANSACTION
	// =========================
	async initializeTransaction({ email, amount, reference, metadata = {}, callbackUrl }) {
		try {
			if (!email) throw new AppError("Email is required", 400);
			if (!amount || amount <= 0) throw new AppError("Invalid amount", 400);

			const response = await this.client.post("/transaction/initialize", {
				email,
				amount: Math.round(amount * 100), // kobo
				reference,
				metadata,
				callback_url: callbackUrl
			});

			return response.data;
		} catch (err) {
			this._handleAxiosError(err, "PAYSTACK_INIT_ERROR", "Failed to initialize Paystack transaction");
		}
	}

	// =========================
	// VERIFY TRANSACTION
	// =========================
	async verifyTransaction(reference) {
		try {
			if (!reference) {
				throw new AppError("Reference is required", 400);
			}

			const response = await this.client.get(`/transaction/verify/${reference}`);

			return {
				reference,
				status: this.mapStatus(response.data.data.status),
				raw: response.data.data
			};
		} catch (err) {
			this._handleAxiosError(err, "PAYSTACK_VERIFY_ERROR", "Failed to verify Paystack transaction");
		}
	}

	// =========================
	// WEBHOOK VERIFICATION (SECURITY CRITICAL)
	// =========================
	verifyWebhookSignature(payload, signature) {
		try {
			if (!signature) return false;

			const hash = crypto
				.createHmac("sha512", this.secretKey)
				.update(JSON.stringify(payload))
				.digest("hex");

			return hash === signature;
		} catch {
			return false;
		}
	}

	// =========================
	// STATUS MAPPING
	// =========================
	mapStatus(status) {
		switch (status) {
			case "success":
				return "successful";
			case "failed":
				return "failed";
			case "abandoned":
				return "failed";
			default:
				return "pending";
		}
	}

	// =========================
	// CENTRAL ERROR HANDLER
	// =========================
	_handleAxiosError(err, code, message) {
		if (err.response) {
			throw new AppError(
				message,
				err.response.status || 500,
				code,
				err.response.data
			);
		}

		if (err.request) {
			throw new AppError(
				"No response from Paystack API",
				503,
				code,
				err.message
			);
		}

		throw new AppError(message, 500, code, err.message);
	}
}