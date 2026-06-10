import { Router } from "express";
import asyncHandler from "express-async-handler";

import { PERMISSION } from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function routerProvisioningRoutes({
    routerProvisioningController,
    permissionService,
    userRepository
}) {
    const router = Router();
    const auth = authMiddleware({ userRepository });

    // =========================
    // PROVISIONING
    // =========================

    router.post(
        "/account/create",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.PROVISION, permissionService),
        asyncHandler((req, res, next) =>
            routerProvisioningController.createAccount(req, res, next)
        )
    );

    router.post(
        "/subscription/provision",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.PROVISION, permissionService),
        asyncHandler((req, res, next) =>
            routerProvisioningController.provisionSubscription(req, res, next)
        )
    );

    router.post(
        "/account/suspend",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.SUSPEND, permissionService),
        asyncHandler((req, res, next) =>
            routerProvisioningController.suspend(req, res, next)
        )
    );

    router.post(
        "/account/resume",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.RESUME, permissionService),
        asyncHandler((req, res, next) =>
            routerProvisioningController.resume(req, res, next)
        )
    );

    router.get(
        "/:id/profiles",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
        asyncHandler((req, res, next) =>
            routerProvisioningController.getProfiles(req, res, next)
        )
    );

    return router;
}