// controllers/adminController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Subscription = require("../models/subscriptionModel");
const Payment = require("../models/paymentModel");
const mikrotikQueue = require("../queues/mikrotikQueue");
const routerosHelpers = require("../utils/routerosHelpers");
const validator = require("validator");

// ---------------------------
// 1️⃣ GET ALL USERS
// ---------------------------
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().populate("subscription").select("-password -verificationToken");
    res.status(200).json(users);
});



const searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query; // q = search query
    if (!q) return res.status(400).json({ message: "Query required" });

    const users = await User.find({
        $or: [
            { wsnId: q },
            { email: { $regex: q, $options: "i" } },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } }
        ]
    }).select("-password -verificationToken").populate("subscription");

    res.status(200).json(users);
});


// ---------------------------
// 2️⃣ GET SINGLE USER
// ---------------------------
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate("subscription").select("-password -verificationToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
});

// ---------------------------
// 3️⃣ UPDATE USER DETAILS (admin)
/// Can update firstName, lastName, email, profilePicture
// ---------------------------
const updateUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, profilePicture } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate email if updating
    if (email && email !== user.email) {
        if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email format" });
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: "Email already in use" });
        user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
});

// ---------------------------
// 4️⃣ CHANGE USER SUBSCRIPTION + QUEUE SYNC
// ---------------------------
const updateUserSubscription = asyncHandler(async (req, res) => {
    const { newPlanId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await Subscription.findById(newPlanId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    user.subscription = plan._id;
    user.subscriptionStatus = "active";
    await user.save();

    // Enqueue MikroTik profile update
    await mikrotikQueue.add("updateProfile", {
        userId: user._id,
        wsnId: user.wsnId,
        profile: plan.mikrotikProfile,
    });

    res.status(200).json({ message: "Subscription updated successfully" });
});

// ---------------------------
// 5️⃣ ENABLE USER
// ---------------------------
const enableUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.subscriptionStatus = "active";
    await user.save();

    await mikrotikQueue.add("enableUser", {
        userId: user._id,
        wsnId: user.wsnId,
    });

    res.status(200).json({ message: "User enabled successfully" });
});

// ---------------------------
// 6️⃣ DISABLE USER
// ---------------------------
const disableUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.subscriptionStatus = "expired";
    await user.save();

    await mikrotikQueue.add("disableUser", {
        userId: user._id,
        wsnId: user.wsnId,
    });

    res.status(200).json({ message: "User disabled successfully" });
});

// ---------------------------
// 7️⃣ GET USER PAYMENT HISTORY
// ---------------------------
const getUserPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.params.id }).sort("-createdAt");
    res.status(200).json(payments);
});

// ---------------------------
// 8️⃣ GET ALL SUBSCRIPTIONS
// ---------------------------
const getAllSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find();
    res.status(200).json(subscriptions);
});

// ---------------------------
// 9️⃣ CREATE NEW SUBSCRIPTION PLAN
// ---------------------------
const createSubscription = asyncHandler(async (req, res) => {
    const { planName, price, speedRate, devicesAllowed, features, mikrotikProfile, durationDays, description } = req.body

    // Validate required fields
    if (!planName || price == null || !speedRate || !mikrotikProfile) {
        return res.status(400).json({ message: "Missing required fields." })
    }

    // Validate numeric fields
    if (price < 0) return res.status(400).json({ message: "Price must be >= 0" })
    if (devicesAllowed && devicesAllowed < 1) return res.status(400).json({ message: "devicesAllowed must be >= 1" })

    const plan = await Subscription.create({
        planName,
        price,
        speedRate,
        devicesAllowed: devicesAllowed || 1,
        features,
        mikrotikProfile,
        durationDays: durationDays || 30,
        description,
    })

    res.status(201).json({ message: "Plan created", plan })
})

// ---------------------------
// 🔟 UPDATE SUBSCRIPTION PLAN
// ---------------------------
const updateSubscription = asyncHandler(async (req, res) => {
    const { name, price, duration, mikrotikProfile } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    subscription.name = name || subscription.name;
    subscription.price = price || subscription.price;
    subscription.duration = duration || subscription.duration;
    subscription.mikrotikProfile = mikrotikProfile || subscription.mikrotikProfile;

    await subscription.save();
    res.status(200).json(subscription);
});

// ---------------------------
// 1️⃣1️⃣ DELETE SUBSCRIPTION PLAN
// ---------------------------
const deleteSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    await subscription.remove();
    res.status(200).json({ message: "Subscription deleted successfully" });
});

// ---------------------------
// 1️⃣2️⃣ GET ALL PAYMENTS
// ---------------------------
const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find().sort("-createdAt");
    res.status(200).json(payments);
});

// ---------------------------
// 1️⃣3️⃣ KICK ACTIVE USER SESSION (RouterOS)
// ---------------------------
const kickUserSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    try {
        await routerosHelpers.kickUserSession(sessionId);
        res.status(200).json({ message: "User session kicked successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ---------------------------
// 1️⃣4️⃣ GET ALL ACTIVE USERS (RouterOS)
// ---------------------------
const getActiveHotspotUsers = asyncHandler(async (req, res) => {
    try {
        const sessions = await routerosHelpers.getActiveUsers();
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ---------------------------
// EXPORT ALL
// ---------------------------
module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserSubscription,
    enableUser,
    disableUser,
    getUserPayments,
    getAllSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getAllPayments,
    kickUserSession,
    getActiveHotspotUsers,
};
