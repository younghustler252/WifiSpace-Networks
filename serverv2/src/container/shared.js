import { asClass } from "awilix";

import { AuditService } from "../shared/services/audit.service.js";
import { PasswordService } from "../shared/services/password.service.js";
import { PermissionService } from "../shared/services/permission.service.js";
import { CloudinaryService } from "../shared/services/cloudinary.service.js";
import { TokenService } from "../shared/services/token.service.js";
import { MailService } from "../infrastructure/mail/services/mail.service.js";
import { FileStorageService } from "../shared/services/file-storage.service.js";

import { PaystackGateway } from "../infrastructure/payments/paystack.gateway.js";
import { PaymentGatewayRegistry } from "../infrastructure/payments/paystack.gateway.register.js";

import { MikrotikClient } from "../infrastructure/networking/mikrotik/mikrotik.client.js";
import { MikrotikManager } from "../infrastructure/networking/mikrotik/mikrotik.manager.js";

import { HotspotService } from "../infrastructure/networking/mikrotik/services/hotspot.service.js";
import { PppoeService } from "../infrastructure/networking/mikrotik/services/pppoe.service.js";
import { RouterService } from "../infrastructure/networking/mikrotik/services/router.service.js";

import { BaseRepository } from "../infrastructure/repositories/base.repository.js";

import TrackAnalytics from "../modules/analytics/usecases/track-analytics.js";

import AnalyticsRepositoryMongo from "../modules/analytics/infrastructure/repositories/analytics.repository.mongo.js";
import { AuditRepositoryMongo } from "../modules/audit/infrastructure/repositories/audit.repository.mongo.js";


export function registerShared(container) {

	container.register({

		auditRepository:
			asClass(AuditRepositoryMongo).singleton(),

		auditService:
			asClass(AuditService).singleton(),

		passwordService:
			asClass(PasswordService).singleton(),

		permissionService:
			asClass(PermissionService).singleton(),

		cloudinaryService:
			asClass(CloudinaryService).singleton(),

		tokenService:
			asClass(TokenService).singleton(),

		mailService:
			asClass(MailService).singleton(),

		fileStorageService:
			asClass(FileStorageService).singleton(),


		analyticsRepository:
			asClass(AnalyticsRepositoryMongo).singleton(),

		analyticsTracker:
			asClass(TrackAnalytics).singleton(),


		// Payments

		paystackGateway:
			asClass(PaystackGateway).singleton(),

		paymentGatewayRegistry:
			asClass(PaymentGatewayRegistry).singleton(),


		// MikroTik Infrastructure

		mikrotikClient:
			asClass(MikrotikClient).singleton(),

		hotspotService:
			asClass(HotspotService).singleton(),

		pppoeService:
			asClass(PppoeService).singleton(),

		routerService:
			asClass(RouterService).singleton(),

		mikrotikManager:
			asClass(MikrotikManager).singleton(),


		// Base

		baseRepository:
			asClass(BaseRepository).singleton()
	});
}