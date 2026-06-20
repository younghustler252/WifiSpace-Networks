import express from "express";
import morgan from "morgan";
import cors from "cors";

import { container } from "./container/index.js";

// Modules
import { usageModule } from "./modules/usage/usage.module.js";
import { paymentModule } from "./modules/payments/payment.module.js";
import { planModule } from "./modules/plan/plan.module.js";
import { subscriptionModule } from "./modules/subscription/subscription.module.js";
import { hotspotModule } from "./modules/hotspot/hotspot.module.js";
import { accountModule } from "./modules/account/account.module.js";
import { authModule } from "./modules/auth/auth.module.js";
import { userModule } from "./modules/user/user.module.js";
import { RouterModule } from "./modules/router/router.module.js";
import { dashboardModule } from "./modules/dashboard/dashboard.module.js";
import { errorMiddleware } from "./shared/middleware/error.middleware.js";

const app = express();

app.use((req, res, next) => {
    console.log("🔥 REQUEST:", req.method, req.url);
    next();
});

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
// ----------------------------
// Middleware
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// ----------------------------
// MODULES (AWILIX CRADLE MODE)
// ----------------------------

const auth = authModule(container.cradle);
const account = accountModule(container.cradle);
const hotspot = hotspotModule(container.cradle)
const payment = paymentModule(container.cradle);
const plan = planModule(container.cradle);
const subscription = subscriptionModule(container.cradle);
const user = userModule(container.cradle);
const router = RouterModule(container.cradle);
const dashboard = dashboardModule(container.cradle);
const usage = usageModule(container.cradle);
// ----------------------------
// ROUTES
// ----------------------------
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

app.use("/api/auth", auth.routes);
app.use("/api/accounts", account.routes);
app.use("/api/hotspot", hotspot.routes)
app.use("/api/payments", payment.routes);
app.use("/api/plans", plan.routes);
app.use("/api/subscriptions", subscription.routes);
app.use("/api/users", user.routes);
app.use("/api/agents", router.routes.agent);
app.use("/api/routers/admin", router.routes.admin);
app.use("/api/routers", router.routes.provisioning);
app.use("/api/usage", usage.routes);
app.use("/api/dashboard", dashboard.routes)
// ----------------------------
// ERROR HANDLER

// ----------------------------
app.use(errorMiddleware);


export default app;