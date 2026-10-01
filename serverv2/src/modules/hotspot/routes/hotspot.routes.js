    import { Router } from "express";
    import asyncHandler from "express-async-handler";
    import { container } from "../../../container/index.js";
    import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
    import { resolveSessionSchema, authenticateSchema, startHotspotSchema, macAddressSchema, connectionStatusSchema } from "../validators/hotspot.validators.js";

    const router = Router();
    const hotspotController = container.resolve("hotspotController");

    router.get("/session", validate(resolveSessionSchema, "query"), asyncHandler(hotspotController.resolveSession));
    router.post("/login", validate(authenticateSchema), asyncHandler(hotspotController.authenticate));
    router.post("/start", validate(startHotspotSchema), asyncHandler(hotspotController.startHotspot));
    router.get("/plans", asyncHandler(hotspotController.getPlans));
    router.get("/status", validate(connectionStatusSchema, "query"), asyncHandler(hotspotController.getConnectionStatus));
    router.post("/refresh", validate(macAddressSchema), asyncHandler(hotspotController.refreshSession));
    router.post("/revoke", validate(macAddressSchema), asyncHandler(hotspotController.revokeSession));

    export default router;