const Payment = require('../models/Payment');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { createPaymentRequest, verifyPayment } = require('../utils/paystack');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const mikrotikQueue = require('../queues/mikrotikQueue'); // Add your Mikrotik queue
const { applySubscription } = require('../services/subscription.service');
const { notify } = require('../services/notification.service');

/* --------------------------------------------------------
   1️⃣ INITIATE PAYMENT
---------------------------------------------------------*/
const initiatePayment = asyncHandler(async (req, res) => {
    let { userId, planId, amount, monthsPaid } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!planId) return res.status(400).json({ error: 'planId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    if (!monthsPaid || monthsPaid < 1) {
        return res.status(400).json({ error: 'monthsPaid is required' });
    }

    // 🔒 Prevent renewing different plan
    const now = new Date();
    const hasActiveSubscription =
        user.subscription &&
        user.subscriptionEnd &&
        new Date(user.subscriptionEnd) > now;

    if (hasActiveSubscription && user.subscription.toString() !== planId.toString()) {
        return res.status(400).json({
            error: 'You can only renew your current plan'
        });
    }

    // 🔐 Validate amount (recommended)
    const expectedAmount = plan.price * monthsPaid;
    if (Number(amount) !== expectedAmount) {
        return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const email = user.email;

    const paystackResponse = await createPaymentRequest(
        expectedAmount,
        email,
        plan.planName,
        planId
    );

    const payment = new Payment({
        userId: user._id,
        wsnId: user.wsnId,
        planId,
        planName: plan.planName,
        amount: expectedAmount,
        monthsPaid,
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
    try {
        // 1️⃣ Prevent double processing
        if (payment.status === "successful") return null;

        // 2️⃣ Load user and plan
        const user = await User.findById(payment.userId);
        if (!user) {
            console.error("User not found for payment:", payment._id);
            return null;
        }

        const plan = await Subscription.findById(payment.planId);
        if (!plan) {
            console.error("Subscription plan not found:", payment.planId);
            return null;
        }

        const monthsPaid = payment.monthsPaid || 1;

        // 3️⃣ Apply subscription
        const result = await applySubscription({
            userId: payment.userId,
            planId: payment.planId,
            monthsPaid
        });

        // 4️⃣ Update payment record
        payment.status = "successful";
        payment.paymentDate = new Date();
        payment.subscriptionStartDate = result.startDate;
        payment.subscriptionEndDate = result.endDate;
        payment.bonusDays = result.bonusDays;

        await payment.save();

        // 5️⃣ Notify user
        await notify({
            user, // full user object for template
            type: "subscription_activated",
            title: "Subscription Activated 🚀",
            message: `Your ${plan.planName} plan is now active until ${new Date(result.endDate).toLocaleDateString("en-ZA", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
            })}.`,
            metadata: {
                subscription: plan,
                startDate: result.startDate,
                endDate: result.endDate,
                bonusDays: result.bonusDays
            },
            groupKey: `subscription_${user._id}_${plan._id}_${result.endDate.getTime()}`
        });

        // 6️⃣ Notify admins
        const admins = await User.find({ role: "admin" });

        for (const admin of admins) {
            await notify({
                user: admin,
                type: "admin_subscription_created",
                title: "New Subscription Activated",
                message: `${user.fullName} activated ${plan.planName}.`,
                metadata: {
                    user,
                    subscription: plan,
                    startDate: result.startDate,
                    endDate: result.endDate,
                    reference: payment._id
                },
                groupKey: `admin_subscription_${payment._id}`
            });
        }

        return result;

    } catch (error) {
        console.error("handleSuccessfulPayment error:", error);
        throw error;
    }
}





/* --------------------------------------------------------
   3️⃣ VERIFY PAYMENT (Callback URL)
---------------------------------------------------------*/
const verifyPaymentStatus = asyncHandler(async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        return res.status(400).json({ error: "Transaction reference required" });
    }

    // -------------------------------------------------
    // 1️⃣ Verify from payment provider
    // -------------------------------------------------
    const verifyResponse = await verifyPayment(reference);
    const { data } = verifyResponse;

    // -------------------------------------------------
    // 2️⃣ Find local payment
    // -------------------------------------------------
    const payment = await Payment.findOne({ transactionId: reference });

    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }

    // -------------------------------------------------
    // 3️⃣ Prevent double-processing
    // -------------------------------------------------
    if (payment.status === "successful") {
        return res.status(200).json({
            message: "Payment already processed",
            payment
        });
    }

    // -------------------------------------------------
    // 4️⃣ Load user once (needed for notifications)
    // -------------------------------------------------
    const user = await User.findById(payment.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // -------------------------------------------------
    // 5️⃣ SUCCESS
    // -------------------------------------------------
    if (data.status === "success") {

        await handleSuccessfulPayment(payment);

        return res.status(200).json({
            message: "Payment verified and user activated successfully",
            payment
        });
    }

    // -------------------------------------------------
    // 6️⃣ FAILURE
    // -------------------------------------------------
    payment.status = "failed";
    await payment.save();

    await notify({
        user, // ✅ full user object
        type: "payment_failed",
        title: "Payment Failed ❌",
        message: `Your payment of ₦${payment.amount} for ${payment.planName} failed.`,
        metadata: {
            planName: payment.planName,
            amount: payment.amount,
            paymentId: payment._id
        },
        groupKey: `payment_${payment._id}`,
        overrideChannels: ["inApp", "email", "whatsapp"]
    });

    return res.status(400).json({
        message: "Payment failed",
        payment
    });
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
