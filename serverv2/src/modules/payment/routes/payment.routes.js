import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import { initiatePaymentSchema, recordPaymentSchema, updatePaymentStatusSchema } from "../validators/payment.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const paymentController = container.resolve("paymentController");
const webhookController = container.resolve("webhookController");
const adminController = container.resolve("adminController");

// Webhooks: no auth (gateway calls this directly), must stay outside authenticate
router.post("/webhooks/paystack", asyncHandler(webhookController.paystack));

router.use(authenticate);

router.post("/", validate(initiatePaymentSchema), asyncHandler(paymentController.initiatePayment));
router.get("/verify/:reference", asyncHandler(paymentController.verifyPayment));
router.get("/me", asyncHandler(paymentController.getMyPayments));

const adminRouter = Router();
adminRouter.use(requireStaff);
adminRouter.get("/", asyncHandler(adminController.getAllPayments));
adminRouter.post("/record", validate(recordPaymentSchema), asyncHandler(adminController.recordPayment));
adminRouter.get("/:id", asyncHandler(adminController.getPaymentById));
adminRouter.patch("/:id/status", validate(updatePaymentStatusSchema), asyncHandler(adminController.updatePaymentStatus));
router.use("/admin", adminRouter);

export default router;