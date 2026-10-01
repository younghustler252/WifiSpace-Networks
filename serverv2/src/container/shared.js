import { asClass, asFunction, asValue } from "awilix";

import { CloudinaryProvider } from "../infrastructure/storage/providers/cloudinary.provider.js";
import { TokenService } from "../shared/services/token.service.js";
import { MailService } from "../infrastructure/mail/providers/mail.service.js";
import { TokenBlacklistService } from "../shared/services/token-blacklist.service.js";
import { PasswordService } from "../shared/services/password.service.js";

import { authenticateFactory } from "../infrastructure/middleware/auth.middleware.js";

import { connection as redisClient } from "../infrastructure/jobs/connection.js";
import { PaystackProvider } from "../infrastructure/payments/providers/paystack.provider.js";
import { PaymentGatewayRegistry } from "../infrastructure/payments/payment-gateway.registry.js";

import { MikrotikClient } from "../infrastructure/networking/mikrotik/mikrotik.client.js";
import { MikrotikManager } from "../infrastructure/networking/mikrotik/mikrotik.manager.js";

import { HotspotService } from "../infrastructure/networking/mikrotik/services/hotspot.service.js";
import { PppoeService } from "../infrastructure/networking/mikrotik/services/pppoe.service.js";
import { RouterService } from "../infrastructure/networking/mikrotik/services/router.service.js";
import { CredentialCipherService } from "../infrastructure/security/credential-cipher.service.js";
// ...
import TrackAnalytics from "../modules/analytics/usecases/track-analytics.js";
import AnalyticsRepositoryMongo from "../modules/analytics/infrastructure/repositories/analytics.repository.mongo.js";

export function registerShared(container) {
	container.register({
		redisClient: asValue(redisClient),

		passwordService: asClass(PasswordService).singleton(),
		fileStorageService: asClass(CloudinaryProvider).singleton(),
		tokenService: asClass(TokenService).singleton(),
		tokenBlacklistService: asClass(TokenBlacklistService).singleton(),
		mailService: asClass(MailService).singleton(),
		credentialCipherService: asClass(CredentialCipherService).singleton(),

		authenticate: asFunction(authenticateFactory).singleton(),
		
		analyticsRepository: asClass(AnalyticsRepositoryMongo).singleton(),
		analyticsTracker: asClass(TrackAnalytics).singleton(),
		
		paystackProvider: asClass(PaystackProvider).singleton(),
		paymentGatewayRegistry: asClass(PaymentGatewayRegistry).singleton(),

		mikrotikClient: asClass(MikrotikClient).singleton(),
		hotspotService: asClass(HotspotService).singleton(),
		pppoeService: asClass(PppoeService).singleton(),
		routerService: asClass(RouterService).singleton(),
		mikrotikManager: asClass(MikrotikManager).singleton()
	});
}