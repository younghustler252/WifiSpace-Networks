const { Worker } = require("bullmq");
const connection = require("../config/bullRedis");
const User = require("../models/User");
const { notify } = require("../services/notification.service");

// Worker listens for jobs in "subscriptionExpiry" queue
new Worker(
    "subscriptionExpiry",
    async job => {
        const now = new Date();

        // -------------------------
        // 2-Day Reminder
        // -------------------------
        const twoDaysLater = new Date(now);
        twoDaysLater.setDate(now.getDate() + 2);

        const twoDayUsers = await User.find({
            subscriptionStatus: "active",
            subscriptionEnd: { $gte: now, $lte: twoDaysLater },
            expiryReminderSent: { $ne: true }
        }).populate("subscription");

        for (const user of twoDayUsers) {
            await notify({
                user,
                type: "subscription_expiring_soon", // template type
                metadata: { subscription: user.subscription },
                groupKey: `expiry_reminder_2days_${user._id}`,
            });
            user.expiryReminderSent = true;
            await user.save();
        }

        // -------------------------
        // 24-Hour Reminder
        // -------------------------
        const oneDayLater = new Date(now);
        oneDayLater.setDate(now.getDate() + 1);

        const oneDayUsers = await User.find({
            subscriptionStatus: "active",
            subscriptionEnd: { $gte: now, $lte: oneDayLater },
            urgentReminderSent: { $ne: true }
        }).populate("subscription");

        for (const user of oneDayUsers) {
            await notify({
                user,
                type: "subscription_expiring_urgent", // template type
                metadata: { subscription: user.subscription },
                groupKey: `expiry_reminder_1day_${user._id}`,
            });
            user.urgentReminderSent = true;
            await user.save();
        }

        console.log("Subscription expiry check completed ✅");
    },
    {
        connection,
        concurrency: 5, // optional, adjust for performance
    }
);
