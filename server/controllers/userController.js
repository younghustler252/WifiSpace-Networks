const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const validator = require("validator");
const mikrotikQueue = require("../queues/mikrotikQueue");
const { getActiveUsers } = require("../utils/routerosHelpers");

// ----------------------------------------------------
// 1️⃣ GET DASHBOARD DATA
// ----------------------------------------------------
const getDashboardData = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate("subscription")
        .select("-password -verificationToken -googleId");

    if (!user) return res.status(404).json({ message: "User not found." });

    const now = new Date();

    const hasActiveSubscription =
        user.subscription &&
        user.subscriptionStatus === "active" &&
        user.subscriptionEnd &&
        user.subscriptionEnd > now;

    let activeSession = null;
    try {
        const activeUsers = await Promise.race([
            getActiveUsers(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("RouterOS not reachable")), 5000)
            ),
        ]);
        activeSession =
            activeUsers.find((a) => a.user === user.wsnId) || null;
    } catch (err) {
        console.error("Could not fetch active users:", err.message);
        activeSession = null;
    }

    const recentPayments = await Payment.find({ userId: user._id })
        .sort("-createdAt")
        .limit(5);

    res.status(200).json({
        profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            fullName: user.fullName,
            wsnId: user.wsnId,
            subscriptionStatus: user.subscriptionStatus,
            lastSeenAt: user.lastSeenAt,
        },
        subscription: hasActiveSubscription
            ? {
                planName: user.subscription.planName,
                price: user.subscription.price,
                speedRate: user.subscription.speedRate,
                durationDays: user.subscription.durationDays,
                devicesAllowed: user.subscription.devicesAllowed,
                features: user.subscription.features,
                mikrotikProfile: user.subscription.mikrotikProfile,
                start: user.subscriptionStart,
                end: user.subscriptionEnd,
            }
            : null,
        usage: {
            totalBytesIn: user.totalBytesIn,
            totalBytesOut: user.totalBytesOut,
            totalTimeOnline: user.usageStats?.totalTimeOnline || 0,
            devicesConnected: user.usageStats?.devicesConnected || 0,
            activeSession,
        },
        recentPayments,
    });
});


// ----------------------------------------------------
// 2️⃣ UPDATE USER PROFILE
// ----------------------------------------------------
const updateUserDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, profilePicture, themePreference } =
        req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
        if (!validator.isEmail(email)) {
            return res
                .status(400)
                .json({ message: "Invalid email format" });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res
                .status(400)
                .json({ message: "Email already in use" });
        }

        user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profilePicture = profilePicture || user.profilePicture;

    if (themePreference && ["light", "dark", "system"].includes(themePreference)) {
        user.themePreference = themePreference;
    }

    await user.save();

    res.status(200).json({
        message: "Profile updated successfully",
        themePreference: user.themePreference,
    });
});

// ----------------------------------------------------
// 3️⃣ CHANGE PASSWORD + MIKROTIK SYNC
// ----------------------------------------------------
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res
            .status(400)
            .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
        return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    user.routerPassword = newPassword;
    await user.save();

    await mikrotikQueue.add("ensureUserExists", {
        userId: user._id,
        wsnId: user.wsnId,
        password: newPassword,
        profile: user.routerProfile || "default",
    });

    await mikrotikQueue.add("updatePassword", {
        userId: user._id,
        wsnId: user.wsnId,
        newPassword,
    });

    res.status(200).json({ message: "Password updated successfully" });
});

module.exports = {
    getDashboardData,
    updateUserDetails,
    changePassword,
};
