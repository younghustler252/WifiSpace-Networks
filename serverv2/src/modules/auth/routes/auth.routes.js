import express from "express"
import { authController } from "../container/auth.container.js"

const router = express.Router()

router.post("/register", (req, res, next) =>
	authController.register(req, res, next)
)

router.post("/login", (req, res, next) =>
	authController.login(req, res, next)
)

router.post("/refresh", (req, res, next) =>
	authController.refreshToken(req, res, next)
)

router.post("/logout", (req, res, next) =>
	authController.logout(req, res, next)
)

router.get("/verify", (req, res, next) =>
	authController.verifyEmail(req, res, next)
)

export default router