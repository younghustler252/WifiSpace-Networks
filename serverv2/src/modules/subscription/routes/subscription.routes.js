import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import {
	subscribeSchema, adminCreateSubscriptionSchema, suspendSubscriptionSchema,
	cancelSubscriptionSchema, extendSubscriptionSchema, changePlanSchema, customerChangePlanSchema, resyncSubscriptionSchema
} from "../validators/subscription.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const idempotent = container.resolve("idempotent");
const subscriptionController = container.resolve("subscriptionController");
const adminController = container.resolve("subscriptionAdminController");

router.use(authenticate);

router.post("/", validate(subscribeSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(subscriptionController.subscribe));
router.get("/me", asyncHandler(subscriptionController.getMySubscriptions));
router.get("/upgrade-options", asyncHandler(subscriptionController.getUpgradeOptions));
router.post("/change-plan", validate(customerChangePlanSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(subscriptionController.changePlan));

const adminRouter = Router();
adminRouter.use(requireStaff);

adminRouter.get("/", asyncHandler(adminController.getAllSubscriptions));
adminRouter.post("/", validate(adminCreateSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.createSubscription));
adminRouter.get("/:id", asyncHandler(adminController.getSubscriptionById));
adminRouter.patch("/:id/renew", idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.renewSubscription));
adminRouter.patch("/:id/change-plan", validate(changePlanSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.changePlan));
adminRouter.patch("/:id/suspend", validate(suspendSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.suspendSubscription));
adminRouter.patch("/:id/resume", idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.resumeSubscription));
adminRouter.patch("/:id/cancel", validate(cancelSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.cancelSubscription));
adminRouter.patch("/:id/extend", validate(extendSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.extendSubscription));
adminRouter.patch("/:id/force-expire", validate(cancelSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.forceExpireSubscription));
adminRouter.post("/:id/resync", validate(resyncSubscriptionSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.resync));

router.use("/admin", adminRouter);

export default router;