import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff, requireSuperAdmin } from "../../../infrastructure/middleware/rbac.middleware.js";
import { createRouterSchema, routerProfilesQuerySchema, updateRouterSchema } from "../validators/router.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const routerController = container.resolve("routerController");

router.use(authenticate, requireStaff);

router.get("/", asyncHandler(routerController.getAllRouters));
router.post("/", requireSuperAdmin, validate(createRouterSchema), asyncHandler(routerController.createRouter));
router.patch("/:id", requireSuperAdmin, validate(updateRouterSchema), asyncHandler(routerController.updateRouter));
router.get("/:id", asyncHandler(routerController.getRouterById));
router.delete("/:id", requireSuperAdmin, asyncHandler(routerController.deleteRouter));
router.post("/:id/sync", asyncHandler(routerController.syncRouterInfo));
router.post("/sync-all", asyncHandler(routerController.syncAllRouters));
router.post("/:id/reboot", requireSuperAdmin, asyncHandler(routerController.rebootRouter));
router.get("/:id/profiles", validate(routerProfilesQuerySchema, "query"), asyncHandler(routerController.getRouterProfiles));

export default router;