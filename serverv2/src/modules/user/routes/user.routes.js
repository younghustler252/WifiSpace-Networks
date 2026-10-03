import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff, requireSuperAdmin } from "../../../infrastructure/middleware/rbac.middleware.js";
import {
	createUserSchema, updateMyProfileSchema, changePasswordSchema,
	updateRoleSchema, banUserSchema, adminUpdateUserSchema, adminSetPasswordSchema
} from "../validators/user.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const userController = container.resolve("userController");
const adminController = container.resolve("userAdminController");



router.use(authenticate);

// ---- Self-service ----
router.get("/me", asyncHandler(userController.getMyProfile));
router.patch("/me", validate(updateMyProfileSchema), asyncHandler(userController.updateMyProfile));
router.patch("/me/password", validate(changePasswordSchema), asyncHandler(userController.changePassword));
router.post("/me/avatar", asyncHandler(userController.uploadAvatar));

// ---- Admin ----
const adminRouter = Router();
adminRouter.use(requireStaff);

adminRouter.get("/", asyncHandler(adminController.getAllUsers));
adminRouter.post("/", validate(createUserSchema), asyncHandler(adminController.createUser));
adminRouter.get("/:id", asyncHandler(adminController.getUserById));
adminRouter.patch("/:id", validate(adminUpdateUserSchema), asyncHandler(adminController.updateUserProfile));
adminRouter.patch("/:id/role", requireSuperAdmin, validate(updateRoleSchema), asyncHandler(adminController.updateRole));
adminRouter.patch("/:id/ban", validate(banUserSchema), asyncHandler(adminController.banUser));
adminRouter.patch("/:id/unban", asyncHandler(adminController.unbanUser));
adminRouter.delete("/:id", asyncHandler(adminController.deleteUser));
adminRouter.patch("/:id/password", validate(adminSetPasswordSchema), asyncHandler(adminController.setUserPassword));
adminRouter.post("/:id/impersonate", requireSuperAdmin, asyncHandler(adminController.impersonateUser));

router.use("/admin", adminRouter);

export default router;