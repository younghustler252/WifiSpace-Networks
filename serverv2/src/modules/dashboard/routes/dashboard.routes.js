import { Router } from "express";
import asyncHandler from "express-async-handler";
import { PERMISSION } from "../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../infrastructure/middleware/auth.middleware.js";
import { requirePermission } from "../../../infrastructure/middleware/permission.middleware.js";

export default function dashboardRoutes({
    dashboardController,
    userRepository,
}) {
    const router = Router();

    const auth = authMiddleware({ userRepository });

    router.get(
        "/admin",
        auth(),
        dashboardController.getAdminDashboardHandler
    );

    router.get(
        "/staff",
        auth(),
        dashboardController.getStaffDashboardHandler
    );

    return router;
}