import { asValue } from "awilix";

import { agentConfig } from "../config/agentConfig.js";

export function registerSecrets(container) {
	container.register({
		secret: asValue(process.env.JWT_SECRET),

		refreshSecret: asValue(process.env.JWT_REFRESH_SECRET),

		bcryptSaltRounds: asValue(
			Number(process.env.BCRYPT_SALT_ROUNDS || 10)
		),

		agentConfig: asValue(agentConfig)
	});
}