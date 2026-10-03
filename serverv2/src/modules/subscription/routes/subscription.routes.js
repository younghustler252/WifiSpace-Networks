import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import {
	subscribeSchema, adminCreateSubscriptionSchema, suspendSubscriptionSchema,
	cancelSubscriptionSchema, extendSubscriptionSchema, changePlanSchema
} from "../validators/subscription.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const subscriptionController = container.resolve("subscriptionController");
const adminController = container.resolve("subscriptionAdminController");

router.use(authenticate);

router.post("/", validate(subscribeSchema), asyncHandler(subscriptionController.subscribe));
router.get("/me", asyncHandler(subscriptionController.getMySubscriptions));

const adminRouter = Router();
adminRouter.use(requireStaff);

adminRouter.get("/", asyncHandler(adminController.getAllSubscriptions));
adminRouter.post("/", validate(adminCreateSubscriptionSchema), asyncHandler(adminController.createSubscription));
adminRouter.get("/:id", asyncHandler(adminController.getSubscriptionById));
adminRouter.patch("/:id/renew", asyncHandler(adminController.renewSubscription));
adminRouter.patch("/:id/change-plan", validate(changePlanSchema), asyncHandler(adminController.changePlan));
adminRouter.patch("/:id/suspend", validate(suspendSubscriptionSchema), asyncHandler(adminController.suspendSubscription));
adminRouter.patch("/:id/resume", asyncHandler(adminController.resumeSubscription));
adminRouter.patch("/:id/cancel", validate(cancelSubscriptionSchema), asyncHandler(adminController.cancelSubscription));
adminRouter.patch("/:id/extend", validate(extendSubscriptionSchema), asyncHandler(adminController.extendSubscription));
adminRouter.patch("/:id/force-expire", validate(cancelSubscriptionSchema), asyncHandler(adminController.forceExpireSubscription));

router.use("/admin", adminRouter);

export default router;