const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const { runCommand } = require('../config/routeros');

// -------------------------
// Customer Service: User Management
// -------------------------

// 1️⃣ Get all users (Customer service can view but not delete)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().populate('subscription');

    if (!users || users.length === 0) {
        res.status(404);
        throw new Error('No users found');
    }

    res.status(200).json(users);
});

// 2️⃣ Get user details (Customer service can view user details)
const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).populate('subscription');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user);
});

// 3️⃣ Update user details (Customer service can update profile information, except sensitive fields like email)
const updateUserDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, profilePicture } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.status(200).json({ message: 'User details updated successfully', user });
});

// 4️⃣ Reactivate/Deactivate a user (Customer service can deactivate a user if required)
const toggleUserActivation = asyncHandler(async (req, res) => {
    const { action } = req.body; // 'activate' or 'deactivate'
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (action === 'deactivate') {
        // Deactivate user on MikroTik
        await runCommand([
            '/ip/hotspot/user/disable',
            `=.id=${user.mikrotikId}`,
        ]);
        user.subscriptionStatus = 'expired';
        await user.save();
        res.status(200).json({ message: 'User deactivated successfully' });
    } else if (action === 'activate') {
        // Reactivate user on MikroTik
        await runCommand([
            '/ip/hotspot/user/enable',
            `=.id=${user.mikrotikId}`,
        ]);
        user.subscriptionStatus = 'active';
        await user.save();
        res.status(200).json({ message: 'User reactivated successfully' });
    } else {
        res.status(400);
        throw new Error('Invalid action. Use "activate" or "deactivate"');
    }
});

// -------------------------
// Customer Service: Subscription Management
// -------------------------

// 1️⃣ Get user subscription details
const getUserSubscriptionDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).populate('subscription');

    if (!user || !user.subscription) {
        res.status(404);
        throw new Error('No subscription found for this user');
    }

    res.status(200).json(user.subscription);
});

// 2️⃣ Update user subscription (Customer service can help update the user’s subscription, such as upgrading/downgrading)
const updateUserSubscription = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    // Update user subscription
    user.subscription = subscription._id;
    user.subscriptionStatus = 'active';
    await user.save();

    res.status(200).json({ message: 'User subscription updated successfully', user });
});

// -------------------------
// Customer Service: Payment & Transaction Management
// -------------------------

// 1️⃣ Get user payment history
const getUserPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.params.userId });

    if (!payments || payments.length === 0) {
        res.status(404);
        throw new Error('No payments found for this user');
    }

    res.status(200).json(payments);
});

// 2️⃣ Get payment details (Customer service can view a specific payment)
const getPaymentDetails = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    res.status(200).json(payment);
});

// 3️⃣ Handle payment issues (Customer service can resolve payment issues by marking payments as failed or successful)
const resolvePaymentIssue = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'failed' or 'successful'
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    // Update payment status
    payment.status = status;
    await payment.save();

    res.status(200).json({ message: 'Payment issue resolved successfully', payment });
});

// -------------------------
// Customer Service: Usage Stats
// -------------------------

// 1️⃣ Get user usage stats
const getUserUsageStats = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Fetch usage stats from MikroTik (e.g., data usage, time online)
    const usageStats = await runCommand([
        '/ip/hotspot/active/print',
        `?user=${user.email}`,
    ]);

    res.status(200).json(usageStats);
});

// -------------------------
// Export Customer Service Controller Functions
// -------------------------
module.exports = {
    getAllUsers,
    getUserDetails,
    updateUserDetails,
    toggleUserActivation,
    getUserSubscriptionDetails,
    updateUserSubscription,
    getUserPayments,
    getPaymentDetails,
    resolvePaymentIssue,
    getUserUsageStats,
};
