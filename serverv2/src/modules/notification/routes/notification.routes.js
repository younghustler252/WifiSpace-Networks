// modules/notifications/routes/notification.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import { createNotificationSchema } from "../validators/notification.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const notificationController = container.resolve("notificationController");
const adminController = container.resolve("notificationAdminController");
router.use(authenticate);

router.get("/me", asyncHandler(notificationController.getMyNotifications));
router.patch("/me/:id/read", asyncHandler(notificationController.markRead));

const adminRouter = Router();
adminRouter.use(requireStaff);
adminRouter.get("/", asyncHandler(adminController.getAllNotifications));
adminRouter.post("/", validate(createNotificationSchema), asyncHandler(adminController.createNotification));
router.use("/admin", adminRouter);

export default router;