import express from "express"
import { userAccountController } from "../container/account.container.js"
import { authMiddleware } from "../../auth/presentation/middleware/auth.middleware.js"

const router = express.Router()

router.get("/", authMiddleware(), userAccountController.getAccounts)

router.post("/", authMiddleware(), userAccountController.requestAccount)

router.put("/:accountId", authMiddleware(), userAccountController.updateAccount)

export default router