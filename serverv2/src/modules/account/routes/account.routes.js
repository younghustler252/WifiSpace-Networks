import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff, requireSuperAdmin, requireOwnerOrStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import {
	requestAccountSchema, adminCreateAccountSchema, rejectAccountSchema,
	pauseAccountSchema, transferAccountSchema, addDeviceSchema
} from "../validators/account.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const accountController = container.resolve("accountController");
const adminController = container.resolve("accountAdminController");

router.use(authenticate);

// ---- Self-service ----
router.get("/me", asyncHandler(accountController.getMyAccounts));
router.get("/me/:id", requireOwnerOrStaff("id", "userId"), asyncHandler(accountController.getMyAccount));
router.post("/me", validate(requestAccountSchema), asyncHandler(accountController.requestAccount));
router.post("/me/:id/devices", validate(addDeviceSchema), asyncHandler(accountController.addDevice));
router.delete("/me/:id/devices/:mac", asyncHandler(accountController.removeDevice));

// ---- Admin ----
const adminRouter = Router();
adminRouter.use(requireStaff);

adminRouter.get("/", asyncHandler(adminController.getAllAccounts));
adminRouter.post("/", validate(adminCreateAccountSchema), asyncHandler(adminController.createAccount));
adminRouter.get("/:id", asyncHandler(adminController.getAccountById));
adminRouter.patch("/:id/approve", asyncHandler(adminController.approveAccount));
adminRouter.patch("/:id/reject", validate(rejectAccountSchema), asyncHandler(adminController.rejectAccount));
adminRouter.patch("/:id/suspend", asyncHandler(adminController.suspendAccount));
adminRouter.patch("/:id/pause", validate(pauseAccountSchema), asyncHandler(adminController.pauseAccount));
adminRouter.patch("/:id/resume", asyncHandler(adminController.resumeAccount));
adminRouter.patch("/:id/terminate", validate(pauseAccountSchema), asyncHandler(adminController.terminateAccount));
adminRouter.patch("/:id/transfer", requireSuperAdmin, validate(transferAccountSchema), asyncHandler(adminController.transferAccount));
adminRouter.delete("/:id", requireSuperAdmin, asyncHandler(adminController.deleteAccount));

router.use("/admin", adminRouter);

export default router;