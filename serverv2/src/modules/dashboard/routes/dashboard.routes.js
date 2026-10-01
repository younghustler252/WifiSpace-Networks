// modules/dashboard/routes/dashboard.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { requireStaff, requireSuperAdmin } from "../../../infrastructure/middleware/rbac.middleware.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const dashboardController = container.resolve("dashboardController");

router.use(authenticate, requireStaff);

router.get("/staff", asyncHandler(dashboardController.getStaffDashboard));
router.get("/admin", requireSuperAdmin, asyncHandler(dashboardController.getAdminDashboard));

export default router;