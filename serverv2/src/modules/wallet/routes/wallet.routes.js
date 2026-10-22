import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { validate } from "../../../infrastructure/middleware/validate.middleware.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";
import { payWithWalletSchema, adjustWalletSchema } from "../validators/wallet.validators.js";

const router = Router();

const authenticate = container.resolve("authenticate");
const idempotent = container.resolve("idempotent");
const walletController = container.resolve("walletController");
const adminController = container.resolve("walletAdminController");

router.use(authenticate);

router.get("/me", asyncHandler(walletController.getMyWallet));
router.get("/me/transactions", asyncHandler(walletController.getMyTransactions));
router.post("/me/virtual-account", asyncHandler(walletController.getVirtualAccount));
router.post("/me/pay", validate(payWithWalletSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(walletController.pay));

const adminRouter = Router();
adminRouter.use(requireStaff);
adminRouter.get("/:userId", asyncHandler(adminController.getWallet));
adminRouter.get("/:userId/transactions", asyncHandler(adminController.getTransactions));
adminRouter.post("/:userId/adjust", validate(adjustWalletSchema), idempotent({ duplicateGuardSeconds: 10 }), asyncHandler(adminController.adjust));
router.use("/admin", adminRouter);

export default router;
