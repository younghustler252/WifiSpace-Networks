import { Router } from "express";
import asyncHandler from "express-async-handler";

import { authMiddleware } from "../../../../infrastructure/middleware/auth.middleware.js";
import { requirePermission } from "../../../../infrastructure/middleware/permission.middleware.js";
import { PERMISSION } from "../../../../shared/constants/permissions.js";

export default function usageRoutes({
    usageController,
    userRepository
}) {
    const router = Router();

    const auth = authMiddleware({ userRepository });

    // ==================================================
    // SYNC USAGE (ADMIN ONLY)
    // ==================================================
    router.post(
        "/sync",
        auth(),
        asyncHandler(usageController.syncUsage)
    );

    // ==================================================
    // GET ALL USAGE (ADMIN DASHBOARD)
    // ==================================================
    router.get(
        "/",
        auth(),
        asyncHandler(usageController.getAllUsages)
    );

    // ==================================================
    // GET SINGLE USAGE (BY ACCOUNT)
    // ==================================================
    router.get(
        "/:accountId",
        auth(),
        asyncHandler(usageController.getUsage)
    );

    return router;
}