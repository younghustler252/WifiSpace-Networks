import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
    import { resolveSessionSchema, authenticateSchema, startHotspotSchema, hotspotWalletSchema, macAddressSchema, connectionStatusSchema } from "../validators/hotspot.validators.js";

    const router = Router();
    const authenticate = container.resolve("authenticate");
    const hotspotController = container.resolve("hotspotController");

    router.get("/session", validate(resolveSessionSchema, "query"), asyncHandler(hotspotController.resolveSession));
    router.post("/login", validate(authenticateSchema), asyncHandler(hotspotController.authenticate));
    router.post("/start", validate(startHotspotSchema), asyncHandler(hotspotController.startHotspot));
    router.post("/wallet", validate(hotspotWalletSchema), asyncHandler(hotspotController.getWallet));
    router.get("/plans", asyncHandler(hotspotController.getPlans));
    router.get("/status", validate(connectionStatusSchema, "query"), asyncHandler(hotspotController.getConnectionStatus));
    router.post("/refresh", validate(macAddressSchema), asyncHandler(hotspotController.refreshSession));
    router.post("/revoke", validate(macAddressSchema), asyncHandler(hotspotController.revokeSession));



    // hotspot/routes/hotspot.routes.js — add below the existing public routes

    const adminController = container.resolve("hotspotAdminController");
    const adminRouter = Router();

    adminRouter.use(authenticate, requireStaff);
    adminRouter.get("/devices", asyncHandler(adminController.getDevices));
    adminRouter.get("/locations", asyncHandler(adminController.getLocations));
    router.use("/admin", adminRouter);


    export default router;