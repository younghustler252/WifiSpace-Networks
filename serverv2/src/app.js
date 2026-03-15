import express from "express";
import morgan from "morgan";

import { errorMiddleware } from "./shared/middleware/error.middleware.js";

// Modules
import { planModule } from "./modules/plan/plan.module.js";
import { subscriptionModule } from "./modules/subscription/subscription.module.js";
import { accountModule } from "./modules/account/account.module.js";
import { authModule } from "./modules/auth/auth.module.js";
import { userModule } from "./modules/user/user.module.js"; // ✅ user module

// Services / Repositories
import { PermissionService } from "./shared/services/permission.service.js";
import { planRepository } from "./modules/plan/infrastructure/repositories/plan.repository.mongo.js";
import { accountRepository } from "./modules/account/infrastructure/repositories/account.repository.mongo.js";
import { userRepository } from "./modules/user/infrastructure/repositories/user.repository.mongo.js"; // optional, replace null if needed

const app = express();

// ----------------------------
// Body parsers
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// Logger
// ----------------------------
app.use(morgan("dev"));

// ----------------------------
// Initialize modules
// ----------------------------
const plan = planModule({ PermissionService });

const subscription = subscriptionModule({
	planRepository,
	accountRepository,
	PermissionService
});

const account = accountModule({
	userRepository: null, // optional
	PermissionService,
	accountRepository
});

const auth = authModule({
	PermissionService,
	jwtSecret: process.env.JWT_SECRET,
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET
});

const user = userModule({
	userRepository,
	PermissionService
});

// ----------------------------
// Mount routes
// ----------------------------
app.use("/api/plans", plan.routes);
app.use("/api/subscriptions", subscription.routes);
app.use("/api/accounts", account.routes);
app.use("/api/auth", auth.routes);
app.use("/api/users", user.routes); // ✅ full user routes (admin, staff, self)

// ----------------------------
// Error handling middleware
// ----------------------------
app.use(errorMiddleware);

export default app;