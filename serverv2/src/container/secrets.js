import { asValue } from "awilix";
import { agentConfig } from "../config/agentConfig.js";

export function registerSecrets(container) {
	container.register({
		secret: asValue(process.env.JWT_SECRET),
		refreshSecret: asValue(process.env.JWT_REFRESH_SECRET),

		bcryptSaltRounds: asValue(Number(process.env.BCRYPT_SALT_ROUNDS || 10)),

		paystackSecretKey: asValue(process.env.PAYSTACK_SECRET_KEY),

		whatsappAccessToken: asValue(process.env.WHATSAPP_ACCESS_TOKEN),
		whatsappPhoneNumberId: asValue(process.env.WHATSAPP_PHONE_NUMBER_ID),

		agentConfig: asValue(agentConfig)
	});
}