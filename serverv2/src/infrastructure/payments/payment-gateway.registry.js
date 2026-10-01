import { AppError } from "../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../modules/payment/domain/payment.enum.js";

export class PaymentGatewayRegistry {
	constructor({ paystackProvider }) {
		this.providers = {
			paystack: paystackProvider
			// flutterwave: flutterwaveProvider — add here once built; no usecase code needs to change
		};
		this.defaultGateway = process.env.DEFAULT_PAYMENT_GATEWAY || "paystack";
	}

	get(gatewayName = this.defaultGateway) {
		const provider = this.providers[gatewayName];
		if (!provider) throw new AppError(`Unsupported or unregistered payment gateway: "${gatewayName}"`, 400, PAYMENT_ERROR_CODES.UNSUPPORTED_GATEWAY);
		return provider;
	}
}