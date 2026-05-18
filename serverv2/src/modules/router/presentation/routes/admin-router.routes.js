import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";
import { PERMISSION } from "../../../../shared/constants/permissions.js";

export default function adminRouterRoutes({
    adminRouterController,
    permissionService,
    userRepository
}) {
    const router = Router();

    // ==================================================
    // CREATE NEW ROUTER
    // ==================================================
    router.post(
        "/",
        
        authMiddleware({ userRepository }, ["superadmin"]),
        requirePermission(PERMISSION.ROUTER.CREATE, permissionService),
        asyncHandler((req, res, next) => adminRouterController.create(req, res, next))
    );

    // ==================================================
    // UPDATE ROUTER
    // ==================================================
    router.put(
        "/:id",
        authMiddleware({ userRepository }, ["superadmin"]),
        requirePermission(PERMISSION.ROUTER.UPDATE, permissionService),
        asyncHandler((req, res, next) => adminRouterController.update(req, res, next))
    );

    // ==================================================
    // DELETE ROUTER
    // ==================================================
    router.delete(
        "/:id",
        authMiddleware({ userRepository }, ["superadmin"]),
        requirePermission(PERMISSION.ROUTER.DELETE, permissionService),
        asyncHandler((req, res, next) => adminRouterController.delete(req, res, next))
    );

    // ==================================================
    // LIST ALL ROUTERS
    // ==================================================
    router.get(
        "/",
        authMiddleware({ userRepository }, ["superadmin"]),
        requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
        asyncHandler((req, res, next) => adminRouterController.list(req, res, next))
    );

    return router;
}