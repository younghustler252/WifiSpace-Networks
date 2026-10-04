import { Router } from "express";
import authRouter from "../modules/auth/routes/auth.routes.js";
import userRouter from "../modules/user/routes/user.routes.js";
import accountRouter from "../modules/account/routes/account.routes.js";
import planRouter from "../modules/plan/routes/plan.routes.js";
import auditRouter from "../modules/audit/routes/audit.routes.js";
import subscriptionRouter from "../modules/subscription/routes/subscription.routes.js";
import hotspotRouter from "../modules/hotspot/routes/hotspot.routes.js";
import PaymentRouter from "../modules/payment/routes/payment.routes.js";
import notificationRouter from "../modules/notification/routes/notification.routes.js";
import dashboardRouter from "../modules/dashboard/routes/dashboard.routes.js";
import routerRouter from "../modules/router/routes/router.routes.js";
import usageRouter from "../modules/usage/routes/usage.routes.js";
import ticketRouter from "../modules/ticket/routes/ticket.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/accounts", accountRouter)
router.use("/plans", planRouter)
router.use("/subscriptions", subscriptionRouter)
router.use("/payments", PaymentRouter)
router.use("/notifications", notificationRouter)
router.use("/dashboard", dashboardRouter)
router.use("/hotspot", hotspotRouter)
router.use("/routers", routerRouter)
router.use("/audit", auditRouter)
router.use("/usage", usageRouter)
router.use("/tickets", ticketRouter)

export default router;