import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff, requireSuperAdmin } from "../../../infrastructure/middleware/rbac.middleware.js";
import {
	createHotspotProfileSchema, updateHotspotProfileSchema, createWalledGardenSchema, updateWalledGardenSchema,
	syncNetworkConfigSchema, importNetworkConfigSchema
} from "../validators/network-config.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const idempotent = container.resolve("idempotent");
const controller = container.resolve("networkConfigController");

router.use(authenticate, requireStaff);

router.get("/status", asyncHandler(controller.status));
router.get("/hotspot-profiles", asyncHandler(controller.listProfiles));
router.get("/walled-garden", asyncHandler(controller.listWalledGarden));

router.use(requireSuperAdmin);

router.post("/hotspot-profiles", validate(createHotspotProfileSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(controller.createProfile));
router.patch("/hotspot-profiles/:id", validate(updateHotspotProfileSchema), asyncHandler(controller.updateProfile));
router.delete("/hotspot-profiles/:id", asyncHandler(controller.deleteProfile));

router.post("/walled-garden", validate(createWalledGardenSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(controller.createWalledGarden));
router.patch("/walled-garden/:id", validate(updateWalledGardenSchema), asyncHandler(controller.updateWalledGarden));
router.delete("/walled-garden/:id", asyncHandler(controller.deleteWalledGarden));

router.post("/import", validate(importNetworkConfigSchema), asyncHandler(controller.importConfig));
router.post("/sync", validate(syncNetworkConfigSchema), asyncHandler(controller.sync));

export default router;
