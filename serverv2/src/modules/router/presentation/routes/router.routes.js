import { Router } from "express";
import asyncHandler from "express-async-handler";

import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";
import { PERMISSION } from "../../../../shared/constants/permissions.js";

export default function routerRoutes({
    routerController,
    permissionService,
    userRepository
}) {
    const router = Router();

    const auth = authMiddleware({ userRepository });

    // ==================================================
    // SUPERADMIN ROUTES
    // ==================================================

    // Create Router
    router.post(
        "/",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_CREATE
        }),
        asyncHandler(routerController.create.bind(routerController))
    );


    // List Routers
    router.get(
        "/",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_LIST
        }),
        asyncHandler(routerController.list.bind(routerController))
    );


    // Update Router
    router.patch(
        "/:id",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_UPDATE
        }),
        asyncHandler(routerController.update.bind(routerController))
    );


    // Delete Router
    router.delete(
        "/:id",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_DELETE
        }),
        asyncHandler(routerController.delete.bind(routerController))
    );


    // Reboot Physical Router
    router.post(
        "/:id/reboot",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_REBOOT
        }),
        asyncHandler(routerController.reboot.bind(routerController))
    );


    // Sync Router Information
    router.post(
        "/:id/sync",
        auth(["superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_SYNC
        }),
        asyncHandler(routerController.sync.bind(routerController))
    );


    // ==================================================
    // STAFF + SUPERADMIN ROUTES
    // ==================================================

    // Router Health / Heartbeat
    router.get(
        "/:id/status",
        auth(["staff", "superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_STATUS_VIEW
        }),
        asyncHandler(routerController.checkStatus.bind(routerController))
    );


    // Router Profiles
    router.get(
        "/:id/profiles",
        auth(["staff", "superadmin"]),
        requirePermission({
            permissionService,
            permission: PERMISSION.ROUTER_PROFILE_VIEW
        }),
        asyncHandler(routerController.getProfiles.bind(routerController))
    );


    return router;
}