const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Subscription = require("../../models/Subscription");
const { getRouterProfiles } = require("../../utils/routerosHelpers")
// ------------------------------------------------------------
// ADMIN: CREATE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const createSubscription = asyncHandler(async (req, res) => {
    const {
        planName,
        price,
        speedRate,
        devicesAllowed,
        features,
        mikrotikProfile,
        durationDays,
        description
    } = req.body;

    // -----------------------------
    // 1️⃣ Basic validation
    // -----------------------------
    if (!planName || price == null || !speedRate) {
        return res.status(400).json({ message: "Missing required fields: planName, price, or speedRate." });
    }

    // -----------------------------
    // 2️⃣ Check if plan already exists
    // -----------------------------
    const existing = await Subscription.findOne({ planName });
    if (existing) return res.status(400).json({ message: "Plan name already exists." });

    // -----------------------------
    // 3️⃣ Determine Mikrotik profile
    // -----------------------------
    let profileToUse = mikrotikProfile || planName; // default to planName if none provided

    // Optionally, validate profile exists on Mikrotik
    try {
        const routerProfiles = await getRouterProfiles(); // fetch available profiles from Mikrotik
        if (!routerProfiles.includes(profileToUse)) {
            return res.status(400).json({
                message: `Mikrotik profile "${profileToUse}" does not exist on the router. Available profiles: ${routerProfiles.join(', ')}`
            });
        }
    } catch (err) {
        console.error("Failed to fetch Mikrotik profiles:", err);
        return res.status(500).json({ message: "Error validating Mikrotik profile." });
    }

    // -----------------------------
    // 4️⃣ Create the plan
    // -----------------------------
    const plan = await Subscription.create({
        planName,
        price,
        speedRate,
        devicesAllowed: devicesAllowed || 1,
        features: Array.isArray(features) ? features : [],
        mikrotikProfile: profileToUse,
        durationDays: durationDays || 30,
        description,
    });

    res.status(201).json({ message: "Plan created successfully", plan });
});

// ------------------------------------------------------------
// ADMIN: UPDATE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const updateSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
    }

    const plan = await Subscription.findById(id);
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

    // Whitelist updates to prevent accidental overwrites
    const allowedUpdates = ['planName', 'price', 'speedRate', 'devicesAllowed', 'features', 'mikrotikProfile', 'durationDays', 'description'];
    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
            if (key === 'features') {
                plan[key] = Array.isArray(updates[key]) ? updates[key] : [];
            } else {
                plan[key] = updates[key];
            }
        }
    });

    await plan.save();

    res.status(200).json({ message: "Subscription updated successfully", plan });
});

// ------------------------------------------------------------
// ADMIN: DELETE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const deleteSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
    }

    const plan = await Subscription.findById(id);
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

    await plan.deleteOne();

    res.status(200).json({ message: "Subscription deleted successfully" });
});

const extendUserSubscription = asyncHandler(async (req, res) => {
    const { userId, extraDays } = req.body;

    if (!userId || !extraDays || extraDays <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extend subscription end date
    const currentEnd = user.subscriptionEnd || new Date();
    user.subscriptionEnd = new Date(currentEnd.getTime() + extraDays * 24 * 60 * 60 * 1000);

    await user.save();

    res.status(200).json({ message: `Subscription extended by ${extraDays} days`, subscriptionEnd: user.subscriptionEnd });
});


module.exports = {
    createSubscription,
    updateSubscription,
    deleteSubscription,
    extendUserSubscription
};
