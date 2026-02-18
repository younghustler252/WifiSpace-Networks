const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Calculate bonus days based on months paid
 */
function calculateBonusDays(months) {
    if (months >= 12) return 30;
    return Math.floor(months / 3) * 7;
}

/**
 * Apply or renew subscription
 */
async function applySubscription({ userId, planId, monthsPaid }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const plan = await Subscription.findById(planId);
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const hasActiveSubscription =
        user.subscription &&
        user.subscriptionEnd &&
        new Date(user.subscriptionEnd) > now;

    // 🔒 Only allow renewing same plan
    if (hasActiveSubscription && user.subscription.toString() !== planId.toString()) {
        throw new Error('You can only renew your current plan');
    }

    const baseDays = monthsPaid * 30;
    const bonusDays = calculateBonusDays(monthsPaid);
    const totalDays = baseDays + bonusDays;

    // Decide start date
    const startDate = hasActiveSubscription
        ? new Date(user.subscriptionEnd)
        : now;

    const endDate = new Date(
        startDate.getTime() + totalDays * 24 * 60 * 60 * 1000
    );

    // Update user
    user.subscription = plan._id;
    user.subscriptionStatus = 'active';
    user.subscriptionStart = hasActiveSubscription
        ? user.subscriptionStart
        : startDate;
    user.subscriptionEnd = endDate;

    await user.save();

    return {
        startDate,
        endDate,
        baseDays,
        bonusDays,
        totalDays
    };
}

module.exports = {
    applySubscription
};
