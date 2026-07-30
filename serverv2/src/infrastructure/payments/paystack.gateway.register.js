import { AppError } from "../../shared/errors/app-error.js";

export class PaymentGatewayRegistry {
	constructor({ paystackGateway }) {
		this.gateways = {
			paystack: paystackGateway
			// flutterwave: flutterwaveGateway,  <- adding a second gateway is this line + its class
		};
	}

	get(gatewayName) {
		const gateway = this.gateways[gatewayName];
		if (!gateway) {
			throw new AppError(`Unsupported or unregistered payment gateway: "${gatewayName}"`, 400);
		}
		return gateway;
	}
}