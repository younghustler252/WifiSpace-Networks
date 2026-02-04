const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin controllers
const {
    createSubscription,
    getMikrotikProfiles,
    updateSubscription,
    deleteSubscription,
} = require("../controllers/admin/subscriptionController");

const {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    assignSubscription,
    getUserByWsn,
    searchUsers,
    banUser,
    forceExpireSubscription,
    updateUserRole,
    getAdminDashboard,
} = require("../controllers/admin/userController");

const {
    getAllPayments,
    getPaymentById,
    getPaymentsByUser,
    filterPayments,
} = require("../controllers/admin/paymentController");

// Apply admin middleware globally
router.use(protect, admin);

// ---------------------------
// Subscription routes
// ---------------------------
router.get("/mikrotik-profiles", getMikrotikProfiles);
router.post("/subscriptions", createSubscription);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", deleteSubscription);

// ---------------------------
// User routes
// ---------------------------

// Search users
router.get("/users/search", searchUsers);

// Get user by WSN ID
router.get("/users/wsn/:wsnId", getUserByWsn);

// Get user by ID
router.get("/users/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await getUserById(req, res);
}));

// Get all users
router.get("/users", getAllUsers);

// Create user
router.post("/users", createUser);

// Update user info (including password)
router.put("/users/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await updateUser(req, res);
}));

// Delete user
router.delete("/users/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await deleteUser(req, res);
}));

// Assign / activate subscription
router.put("/users/:userId/subscription", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await assignSubscription(req, res);
}));

// Ban / unban user
router.put("/users/ban/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await banUser(req, res);
}));

// Force expire subscription
router.put("/users/force-expire/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await forceExpireSubscription(req, res);
}));

// Update user role
router.put("/users/role/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await updateUserRole(req, res);
}));

// ---------------------------
// Payment routes
// ---------------------------
router.get("/payments", asyncHandler(async (req, res) => {
    await getAllPayments(req, res);
}));

router.get("/payments/:transactionId", asyncHandler(async (req, res) => {
    await getPaymentById(req, res);
}));

router.get("/payments/user/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    await getPaymentsByUser(req, res);
}));

router.get("/payments/filter", asyncHandler(async (req, res) => {
    await filterPayments(req, res);
}));

// ---------------------------
// Dashboard route
// ---------------------------
router.get("/dashboard", getAdminDashboard);

module.exports = router;
