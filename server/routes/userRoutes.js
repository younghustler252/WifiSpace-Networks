const express = require("express");
const router = express.Router();

const {
    getDashboardData,
    updateUserDetails,
    changePassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// --------------------------
// USER ROUTES (AUTH REQUIRED)
// --------------------------

// Get dashboard data
router.get("/dashboard", protect, getDashboardData);

// Update profile
router.put("/me", protect, updateUserDetails);

// Change password
router.put("/me/password", protect, changePassword);

module.exports = router;
