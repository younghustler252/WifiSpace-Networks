// router/presentation/routes/router.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { PERMISSION } from "../../../../shared/constants/permissions.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../../shared/middleware/permission.middleware.js";

export default function routerRoutes({
    routerController,
    permissionService,
    userRepository
}) {
    const router = Router();

    // -----------------------------
    // USER ACTIONS
    // -----------------------------

    // Customers can check their router status
    router.get(
        "/:id/status",
        authMiddleware({ userRepository }, ["customer"]),
        requirePermission(PERMISSION.ROUTER.VIEW, permissionService),
        asyncHandler((req, res, next) => routerController.checkStatus(req, res, next))
    );

    // Customers can reboot their own router
    router.post(
        "/:id/reboot",
        authMiddleware({ userRepository }, ["customer"]),
        requirePermission(PERMISSION.ROUTER.REBOOT, permissionService),
        asyncHandler((req, res, next) => routerController.reboot(req, res, next))
    );

    // -----------------------------
    // STAFF / SUPERADMIN ACTIONS
    // -----------------------------

    // Provision new account (staff + superadmin)
    router.post(
        "/admin/provision",
        authMiddleware({ userRepository }, ["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.PROVISION, permissionService),
        asyncHandler((req, res, next) => routerController.provision(req, res, next))
    );

    // Suspend account (superadmin only)
    router.post(
        "/admin/suspend",
        authMiddleware({ userRepository }, ["superadmin"]),
        requirePermission(PERMISSION.ROUTER.SUSPEND, permissionService),
        asyncHandler((req, res, next) => routerController.suspend(req, res, next))
    );

    // Resume account (staff + superadmin)
    router.post(
        "/admin/resume",
        authMiddleware({ userRepository }, ["staff", "superadmin"]),
        requirePermission(PERMISSION.ROUTER.RESUME, permissionService),
        asyncHandler((req, res, next) => routerController.resume(req, res, next))
    );

    return router;
}