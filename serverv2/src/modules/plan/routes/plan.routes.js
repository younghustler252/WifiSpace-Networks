// routes/plan.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import { createPlanSchema, updatePlanSchema } from "../validators/plan.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const planController = container.resolve("planController");
const adminController = container.resolve("adminController");

// Public catalog — no auth required, a prospective customer should be able to browse plans before signing up
router.get("/", asyncHandler(planController.getPlans));
router.get("/:id", asyncHandler(planController.getPlanById));

const adminRouter = Router();
adminRouter.use(authenticate, requireStaff);

adminRouter.get("/", asyncHandler(adminController.getPlans));
adminRouter.get("/:id", asyncHandler(adminController.getPlanById));
adminRouter.post("/", validate(createPlanSchema), asyncHandler(adminController.createPlan));
adminRouter.patch("/:id", validate(updatePlanSchema), asyncHandler(adminController.updatePlan));
adminRouter.delete("/:id", asyncHandler(adminController.deletePlan));
adminRouter.patch("/:id/activate", asyncHandler(adminController.activatePlan));
adminRouter.patch("/:id/deactivate", asyncHandler(adminController.deactivatePlan));

router.use("/admin", adminRouter);

export default router;