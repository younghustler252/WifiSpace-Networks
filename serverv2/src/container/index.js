import { createContainer, asClass, asValue } from "awilix";

/*
|--------------------------------------------------------------------------
| MODULE REGISTRARS
|--------------------------------------------------------------------------
*/
import { registerDashboard } from "../modules/dashboard/dashboard.container.js";
import { registerUsage } from "../modules/usage/usage.container.js";
import { registerAnalytics } from "../modules/analytics/analytics.container.js";
import { registerRouter } from "../modules/router/router.cotainer.js";
import { registerPayment } from "../modules/payments/payment.container.js";
import { registerSubscription } from "../modules/subscription/subscription.container.js";
import { registerPlan } from "../modules/plan/plan.container.js";
import { registerHotspot } from "../modules/hotspot/hotspot.container.js";
import { registerAccount } from "../modules/account/account.container.js";
import { registerUser } from "../modules/user/user.container.js";
import { registerAuth } from "../modules/auth/auth.container.js";

/*
|--------------------------------------------------------------------------
| SHARED SERVICES
|--------------------------------------------------------------------------
*/
import { AuditService } from "../shared/services/audit.service.js";
import { PasswordService } from "../shared/services/password.service.js";
import { PermissionService } from "../shared/services/permission.service.js";
import { CloudinaryService } from "../shared/services/cloudinary.service.js";
import { TokenService } from "../shared/services/token.service.js";
import { MailService } from "../shared/mail/services/mail.service.js";
import { FileStorageService } from "../shared/services/file-storage.service.js";
import TrackAnalytics from "../modules/analytics/usecases/track-analytics.js";

import { agentConfig } from "../config/agentConfig.js";

import { BaseRepository } from "../shared/infrastructure/repository/base.repository.js";
import AnalyticsRepositoryMongo from "../modules/analytics/infrastructure/repositories/analytics.repository.mongo.js";
import { AuditRepositoryMongo } from "../modules/audit/infrastructure/repositories/audit.repository.mongo.js";
/*
|--------------------------------------------------------------------------
| CONTAINER
|--------------------------------------------------------------------------
*/
export const container = createContainer({
  injectionMode: "PROXY",
  strict: true
});

/*
|--------------------------------------------------------------------------
| CORE SHARED SERVICES
|--------------------------------------------------------------------------
*/
container.register({
  auditRepository: asClass(AuditRepositoryMongo).singleton(), 
  auditService: asClass(AuditService).singleton(),
  passwordService: asClass(PasswordService).singleton(),
  permissionService: asClass(PermissionService).singleton(),
  cloudinaryService: asClass(CloudinaryService).singleton(),
  tokenService: asClass(TokenService).singleton(),
  mailService: asClass(MailService).singleton(),
  fileStorageService: asClass(FileStorageService).singleton(),
  analyticsRepository: asClass(AnalyticsRepositoryMongo).singleton(),
  analyticsTracker: asClass(TrackAnalytics).singleton(),
  // baseRepository: asClass(BaseRepository).singleton()
});

container.register({
  secret: asValue(process.env.JWT_SECRET),
  refreshSecret: asValue(process.env.JWT_REFRESH_SECRET),
  bcryptSaltRounds: asValue(Number(process.env.BCRYPT_SALT_ROUNDS || 10)),
  agentConfig: asValue(agentConfig)
});

/*
|--------------------------------------------------------------------------
| MODULE REGISTRATION
|--------------------------------------------------------------------------
*/
const modules = [
  registerDashboard,
  registerRouter,
  registerPayment,
  registerSubscription,
  registerPlan,
  registerHotspot,
  registerAccount,
  registerUser,
  registerAuth,
  registerAnalytics,
  registerUsage
];

modules.forEach(fn => fn(container));