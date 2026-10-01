// routes/usage.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";

const router = Router();
const authenticate = container.resolve("authenticate");
const usageController = container.resolve("usageController");
const adminController = container.resolve("adminController");

router.use(authenticate);
router.get("/accounts/:accountId/me", asyncHandler(usageController.getMyUsage));

const adminRouter = Router();
adminRouter.use(requireStaff);
adminRouter.get("/subscriptions/:subscriptionId/stats", asyncHandler(adminController.getUsageStats));
adminRouter.get("/subscriptions/:subscriptionId", asyncHandler(adminController.getAllUsage));
router.use("/admin", adminRouter);

export default router;