const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Subscription = require("../../models/Subscription");

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

    if (!planName || price == null || !speedRate || !mikrotikProfile) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await Subscription.findOne({ planName });
    if (existing) return res.status(400).json({ message: "Plan name already exists." });

    const plan = await Subscription.create({
        planName,
        price,
        speedRate,
        devicesAllowed: devicesAllowed || 1,
        features: Array.isArray(features) ? features : [],
        mikrotikProfile,
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

module.exports = {
    createSubscription,
    updateSubscription,
    deleteSubscription,
};
