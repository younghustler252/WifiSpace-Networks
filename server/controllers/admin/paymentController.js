const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const asyncHandler = require('express-async-handler');
const mikrotikQueue = require('../../queues/mikrotikQueue');

/* --------------------------------------------------------
   1️⃣ GET ALL PAYMENTS (with filters & pagination)
---------------------------------------------------------*/
const getAllPayments = asyncHandler(async (req, res) => {
    const {
        status,
        wsnId,
        planName,
        startDate,
        endDate,
        page = 1,
        limit = 50
    } = req.query;

    const query = {};

    if (status) query.status = status;

    // 🔍 Resolve user by WSN ID
    if (wsnId) {
        const user = await User.findOne({ wsnId }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        query.userId = user._id;
    }

    // 🔍 Resolve subscription by planName
    if (planName) {
        const subscription = await Subscription.findOne({
            planName: { $regex: planName, $options: "i" } // partial + case-insensitive
        }).select("_id");

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        query.planId = subscription._id;
    }

    // 📅 Date filtering
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("userId", "firstName lastName email wsnId")
        .populate("planId", "planName price durationDays");

    const total = await Payment.countDocuments(query);

    res.status(200).json({
        payments,
        page: Number(page),
        limit: Number(limit),
        total
    });
});



/* --------------------------------------------------------
   2️⃣ GET SINGLE PAYMENT
---------------------------------------------------------*/
const getPaymentById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
        .populate('userId', 'firstName lastName email wsnId')
        .populate('planId', 'planName price durationDays');

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.status(200).json(payment);
});

/* --------------------------------------------------------
   3️⃣ MANUAL ACTIVATE PAYMENT (Admin)
       Useful if auto webhook fails
---------------------------------------------------------*/
const activatePaymentManually = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status === 'successful') return res.status(400).json({ error: 'Payment already activated' });

    // Update payment & subscription
    const plan = await Subscription.findById(payment.planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const start = new Date();
    const end = new Date(start.getTime() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000);

    payment.status = 'successful';
    payment.paymentDate = start;
    payment.subscriptionStartDate = start;
    payment.subscriptionEndDate = end;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user) {
        user.subscription = plan._id;
        user.subscriptionStatus = 'active';
        user.subscriptionStart = start;
        user.subscriptionEnd = end;
        await user.save();

        // Mikrotik activation
        await mikrotikQueue.add('ensureUserExists', {
            userId: user._id,
            wsnId: user.wsnId,
            password: user.routerPassword || user.password,
            profile: plan.mikrotikProfile || 'default',
        });

        await mikrotikQueue.add('updateProfile', {
            userId: user._id,
            wsnId: user.wsnId,
            profile: plan.mikrotikProfile,
        });

        await mikrotikQueue.add('enableUser', {
            userId: user._id,
            wsnId: user.wsnId,
        });
    }

    res.status(200).json({ message: 'Payment manually activated successfully', payment });
});

/* --------------------------------------------------------
   4️⃣ GET PAYMENT STATS & ANALYTICS
---------------------------------------------------------*/
const getPaymentAnalytics = asyncHandler(async (req, res) => {
    const totalRevenueAgg = await Payment.aggregate([
        { $match: { status: 'successful' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const revenuePerPlan = await Payment.aggregate([
        { $match: { status: 'successful' } },
        { $group: { _id: '$planId', totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: '_id', as: 'plan' } },
        { $unwind: '$plan' },
        { $project: { planName: '$plan.planName', totalRevenue: 1, count: 1 } },
    ]);

    const activeUsersPerPlan = await User.aggregate([
        { $match: { subscriptionStatus: 'active' } },
        { $group: { _id: '$subscription', activeUsers: { $sum: 1 } } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: '_id', as: 'plan' } },
        { $unwind: '$plan' },
        { $project: { planName: '$plan.planName', activeUsers: 1 } },
    ]);

    res.status(200).json({
        totalRevenue: totalRevenueAgg[0]?.totalRevenue || 0,
        totalPayments: totalRevenueAgg[0]?.count || 0,
        revenuePerPlan,
        activeUsersPerPlan,
    });
});

module.exports = {
    getAllPayments,
    getPaymentById,
    activatePaymentManually,
    getPaymentAnalytics,
};
