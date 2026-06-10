import { Router } from "express";
import asyncHandler from "express-async-handler";

import { PERMISSION } from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function routerAdminRoutes({
    routerAdminController,
    permissionService,
    userRepository
}) {
    const router = Router();
    const auth = authMiddleware({ userRepository });

    // =========================
    // ADMIN CRUD
    // =========================

    router.post(
        "/",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.CREATE, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.create(req, res, next)
        )
    );

    router.get(
        "/",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.list(req, res, next)
        )
    );

    router.put(
        "/:id",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.UPDATE, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.update(req, res, next)
        )
    );

    router.delete(
        "/:id",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.DELETE, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.delete(req, res, next)
        )
    );

    // =========================
    // DEVICE OPS (admin side)
    // =========================

    router.get(
        "/:id/status",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.checkStatus(req, res, next)
        )
    );

    router.post(
        "/:id/reboot",
        auth(["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.REBOOT, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.reboot(req, res, next)
        )
    );

    router.post(
        "/:id/sync",
        auth(["superadmin"]),
        requirePermission(PERMISSION.ROUTER.UPDATE, permissionService),
        asyncHandler((req, res, next) =>
            routerAdminController.sync(req, res, next)
        )
    );

    return router;
}