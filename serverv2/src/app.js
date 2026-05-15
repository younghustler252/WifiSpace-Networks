import express from "express";
import morgan from "morgan";
import cors from "cors";

import { errorMiddleware } from "./shared/middleware/error.middleware.js";

// Modules
import { paymentModule } from "./modules/payments/payment.module.js";
import { planModule } from "./modules/plan/plan.module.js";
import { subscriptionModule } from "./modules/subscription/subscription.module.js";
import { accountModule } from "./modules/account/account.module.js";
import { authModule } from "./modules/auth/auth.module.js";
import { userModule } from "./modules/user/user.module.js";

// Services / Repositories
import { PermissionService } from "./shared/services/permission.service.js";
import { PlanRepositoryMongo } from "./modules/plan/infrastructure/repositories/plan.repository.mongo.js";
import { AccountRepositoryMongo } from "./modules/account/infrastructure/repositories/account.repository.mongo.js";
import { UserRepositoryMongo } from "./modules/user/infrastructure/repositories/user.repository.mongo.js";
import { PaymentRepositoryMongo } from "./modules/payments/infrastructure/repositories/payment.repository.mongo.js";
import { PaystackPaymentService } from "./modules/payments/services/paystack.service.js";


import "./shared/jobs/index.js";

 
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

const FRONTEND_URL = process.env.FRONTEND_URL

// app.use(cors({
//     origin: FRONTEND_URL,
//     credentials: false
// }));

app.use(cors());
// ----------------------------
// Initialize shared services & repositories
// ----------------------------
const userRepository = new UserRepositoryMongo();
const planRepository = new PlanRepositoryMongo();
const accountRepository = new AccountRepositoryMongo();
const permissionService = new PermissionService(userRepository);
const paymentRepository = new PaymentRepositoryMongo();

// Initialize the Paystack service (if you're using Paystack)
const paystackService = new PaystackPaymentService({
    repository: paymentRepository,
    secretKey: process.env.PAYSTACK_SECRET_KEY
});

// ----------------------------
// Initialize modules
// ----------------------------
const payment = paymentModule({
    planRepository, // You already have this
    accountRepository,
    permissionService,
    paystackService,
    userRepository
});
const plan = planModule({ permissionService });
const subscription = subscriptionModule({ planRepository, accountRepository, permissionService });
const account = accountModule({ userRepository, accountRepository, permissionService });
const auth = authModule({ permissionService, jwtSecret: process.env.JWT_SECRET, jwtRefreshSecret: process.env.JWT_REFRESH_SECRET });
const user = userModule({ permissionService });



app.get("/", (req, res) => {
    res.status(200).json({
        message: "✅ Server is running and ready for API testing!"
    });
});
// ----------------------------
// Mount routes
// ----------------------------\
app.use("/api/payments", payment.routes);
app.use("/api/plans", plan.routes);
app.use("/api/subscriptions", subscription.routes);
app.use("/api/accounts", account.routes);
app.use("/api/auth", auth.routes);
app.use("/api/users", user.routes);

// ----------------------------
// Error handling middleware
// ----------------------------
app.use(errorMiddleware);

export default app;