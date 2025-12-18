const Payment = require('../models/Payment');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { createPaymentRequest, verifyPayment } = require('../utils/paystack');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const mikrotikQueue = require('../queues/mikrotikQueue'); // Add your Mikrotik queue

/* --------------------------------------------------------
   1️⃣ INITIATE PAYMENT
---------------------------------------------------------*/
const initiatePayment = asyncHandler(async (req, res) => {
    let { userId, planId, amount, planName } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!planId) return res.status(400).json({ error: 'planId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const email = user.email;

    // Ensure amount is a valid number
    amount = Number(amount);
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a number greater than 0' });
    }

    const paystackResponse = await createPaymentRequest(amount, email, plan.planName, planId);

    const payment = new Payment({
        userId: user._id,
        wsnId: user.wsnId,
        planId,
        planName: plan.planName,
        amount,
        method: 'paystack',
        status: 'pending',
        transactionId: paystackResponse.data.reference,
    });

    await payment.save();

    res.status(200).json({
        message: 'Payment request initialized successfully',
        paymentUrl: paystackResponse.data.authorization_url,
    });
});

/* --------------------------------------------------------
   2️⃣ HANDLE PAYMENT SUCCESS (UPGRADE/DOWNGRADE)
---------------------------------------------------------*/
async function handleSuccessfulPayment(payment) {
    const plan = await Subscription.findById(payment.planId);
    const start = new Date();
    const end = new Date(start.getTime() + (plan?.durationDays || 30) * 24 * 60 * 60 * 1000);

    // Update payment
    payment.status = 'successful';
    payment.paymentDate = start;
    payment.subscriptionStartDate = start;
    payment.subscriptionEndDate = end;
    await payment.save();

    // Update user subscription
    const user = await User.findById(payment.userId);
    if (!user) return;

    // Check if user already has a plan (upgrade/downgrade)
    const previousPlanId = user.subscription;
    const isUpgrade = previousPlanId && previousPlanId.toString() !== plan._id.toString();

    user.subscription = payment.planId;
    user.subscriptionStatus = 'active';
    user.subscriptionStart = start;
    user.subscriptionEnd = end;
    await user.save();

    // -----------------------------------------------
    // Mikrotik activation / profile update
    // -----------------------------------------------

    // Ensure user exists on Mikrotik
    await mikrotikQueue.add('ensureUserExists', {
        userId: user._id,
        wsnId: user.wsnId,
        password: user.routerPassword || user.password,
        profile: plan.mikrotikProfile || user.routerProfile || 'default',
    });

    // Update Mikrotik profile (in case of upgrade/downgrade)
    if (isUpgrade) {
        await mikrotikQueue.add('updateProfile', {
            userId: user._id,
            wsnId: user.wsnId,
            profile: plan.mikrotikProfile,
        });
    }

    // Enable user on Mikrotik
    await mikrotikQueue.add('enableUser', {
        userId: user._id,
        wsnId: user.wsnId,
    });
}

/* --------------------------------------------------------
   3️⃣ VERIFY PAYMENT (Callback URL)
---------------------------------------------------------*/
const verifyPaymentStatus = asyncHandler(async (req, res) => {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'Transaction reference required' });

    const verifyResponse = await verifyPayment(reference);
    const { data } = verifyResponse;

    const payment = await Payment.findOne({ transactionId: reference });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (data.status === 'success') {
        await handleSuccessfulPayment(payment);
        return res.status(200).json({ message: 'Payment verified and user activated successfully', payment });
    }

    payment.status = 'failed';
    await payment.save();
    res.status(400).json({ message: 'Payment failed', payment });
});

/* --------------------------------------------------------
   4️⃣ PAYSTACK WEBHOOK
---------------------------------------------------------*/
const paystackWebhook = asyncHandler(async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).send('Invalid signature');
    }

    const event = req.body.event;
    const data = req.body.data;

    if (event === 'charge.success') {
        const payment = await Payment.findOne({ transactionId: data.reference });
        if (payment) {
            await handleSuccessfulPayment(payment);
        }
    }

    res.sendStatus(200);
});

const getMyPayments = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const userId = req.user._id; // from JWT
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    // Count total payments for pagination info
    const totalPayments = await Payment.countDocuments({ userId });

    // Fetch payments with pagination
    const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 }) // latest first
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName email'); // optional

    res.status(200).json({
        payments,
        page,
        limit,
        totalPayments,
        totalPages: Math.ceil(totalPayments / limit)
    });
});


/* --------------------------------------------------------
   6️⃣ GET SINGLE PAYMENT
---------------------------------------------------------*/
const getSinglePayment = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.status(200).json(payment);
});

module.exports = {
    initiatePayment,
    verifyPaymentStatus,
    paystackWebhook,
    getMyPayments,
    getSinglePayment,
};
