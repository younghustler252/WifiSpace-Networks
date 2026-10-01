import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const auditController = container.resolve("auditController");

router.use(authenticate);

router.get("/me", asyncHandler(auditController.getMyLogs));
router.get("/admin", requireStaff, asyncHandler(auditController.getAllLogs));

export default router;