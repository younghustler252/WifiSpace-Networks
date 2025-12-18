// routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const {
    register,
    login,
    verifyEmail,
    getProfile,
} = require("../controllers/authController");

const { googleAuth } = require("../controllers/googleAuthController");

// Middleware to protect routes
const { protect } = require("../middleware/authMiddleware");

// ---------------------------
// 🔹 AUTH ROUTES
// ---------------------------

// Normal register (Create a new user)
router.post("/register", register);

// Normal login (Authenticate user and return JWT)
router.post("/login", login);

// Google login / register (Authenticate via Google OAuth)
router.post("/google", googleAuth);

// Email verification (Verify email through token sent in email)
router.get("/verify-email", verifyEmail);

// Get current user profile (JWT protected)
router.get("/profile", protect, getProfile);

module.exports = router;
