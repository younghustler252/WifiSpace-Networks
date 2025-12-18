const asyncHandler = require("express-async-handler");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const User = require("../models/User");
const mikrotikQueue = require("../queues/mikrotikQueue");

// ------------------------------------------------------------
// USER + ADMIN: GET ALL PLANS
// ------------------------------------------------------------
const getAllPlans = asyncHandler(async (req, res) => {
    const plans = await Subscription.find().sort("-createdAt");
    res.status(200).json(plans);
});



// ------------------------------------------------------------
// USER: GET CURRENT SUBSCRIPTION
// ------------------------------------------------------------
const getCurrentSubscription = asyncHandler(async (req, res) => {
    // Use req.user._id (not req.user.id) to find the user
    const user = await User.findById(req.user._id).populate('subscription');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();

    // Check if subscription exists and if it's active
    if (
        !user.subscription ||
        user.subscriptionStatus !== 'active' ||
        !user.subscriptionEnd ||
        user.subscriptionEnd <= now
    ) {
        return res.status(200).json({ subscription: null });
    }

    // Return the current subscription info
    const currentSub = {
        id: user.subscription._id,
        planName: user.subscription.planName,
        status: user.subscriptionStatus,
        start: user.subscriptionStart,
        end: user.subscriptionEnd,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd, // ✅ NEW
        price: user.subscription.price,
        speedRate: user.subscription.speedRate,
        devicesAllowed: user.subscription.devicesAllowed,
        features: user.subscription.features || [],
    };

    res.status(200).json({ subscription: currentSub });
});

module.exports = { getCurrentSubscription };



// ------------------------------------------------------------
// USER: PURCHASE SUBSCRIPTION
// ------------------------------------------------------------
const purchaseSubscription = asyncHandler(async (req, res) => {
    const { planId, paymentMethod } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const payment = await Payment.create({
        userId: user._id,
        amount: plan.price,
        method: paymentMethod || "wallet",
        status: "successful",
        planName: plan.planName,
    });

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + plan.durationDays);

    user.subscription = plan._id;
    user.subscriptionStatus = "active";
    user.subscriptionStart = start;
    user.subscriptionEnd = end;
    user.cancelAtPeriodEnd = false;
    await user.save();

    await mikrotikQueue.add("updateProfile", {
        userId: user._id,
        wsnId: user.wsnId,
        profile: plan.mikrotikProfile,
    });

    await mikrotikQueue.add("enableUser", {
        userId: user._id,
        wsnId: user.wsnId,
    });

    res.status(200).json({
        message: "Subscription purchased successfully",
        subscription: {
            id: plan._id,
            planName: plan.planName,
            status: user.subscriptionStatus,
            start,
            end,
            price: plan.price,
            speedRate: plan.speedRate,
            devicesAllowed: plan.devicesAllowed,
            features: plan.features || [],
        },
        payment,
    });
});

// ------------------------------------------------------------
// USER: CANCEL SUBSCRIPTION
// ------------------------------------------------------------
const unsubscribeUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
        user.subscriptionStatus !== "active" ||
        !user.subscriptionEnd ||
        user.subscriptionEnd <= new Date()
    ) {
        return res.status(400).json({
            message: "No active subscription to cancel",
        });
    }

    user.cancelAtPeriodEnd = true;
    await user.save();

    res.status(200).json({
        message: "Subscription will be canceled at the end of the billing period",
        endsAt: user.subscriptionEnd,
    });
});


// ------------------------------------------------------------
// CRON: AUTO-DEACTIVATE EXPIRED USERS
// ------------------------------------------------------------
const deactivateExpiredSubscriptions = asyncHandler(async () => {
    const now = new Date();

    const users = await User.find({
        subscriptionStatus: "active",
        subscriptionEnd: { $lte: now },
    });

    for (const user of users) {
        user.subscriptionStatus = "expired";
        user.subscription = null;
        user.subscriptionStart = null;
        user.subscriptionEnd = null;
        user.cancelAtPeriodEnd = false;
        await user.save();

        await mikrotikQueue.add("disableUser", {
            userId: user._id,
            wsnId: user.wsnId,
        });
    }
});


module.exports = {
    getAllPlans,
    getCurrentSubscription,
    purchaseSubscription,
    unsubscribeUser,
    deactivateExpiredSubscriptions,
};
