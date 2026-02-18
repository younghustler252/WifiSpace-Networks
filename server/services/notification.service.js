const Notification = require("../models/Notification");
const emailService = require("./email.service");
const whatsappService = require("./whatsapp.service");
const getEmailTemplate = require("../templates/email/emailTemplates");

// --------------------------------------------------
// BUSINESS RULE CONFIG
// --------------------------------------------------

const NOTIFICATION_RULES = {
    payment_failed: {
        defaultPriority: "high",
        defaultChannels: ["inApp", "email"],
        escalateToWhatsApp: true
    },
    subscription_expired: {
        defaultPriority: "critical",
        defaultChannels: ["inApp", "email", "whatsapp"]
    },
    subscription_activated: {
        defaultPriority: "normal",
        defaultChannels: ["inApp", "email"]
    },
    admin_message: {
        defaultPriority: "normal",
        defaultChannels: ["inApp"]
    },
    announcement: {
        defaultPriority: "low",
        defaultChannels: ["inApp"]
    }
};

// --------------------------------------------------
// MAIN SERVICE
// --------------------------------------------------

async function notify(options) {
    const {
        user,
        type,
        title,
        message,
        priority,
        actionUrl = null,
        metadata = {},
        groupKey = null,
        overrideChannels = null
    } = options;

    console.log("🔔 notify() called", { type, user: user?._id, title, message });

    const rules = NOTIFICATION_RULES[type] || {};
    const finalPriority = priority || rules.defaultPriority || "normal";

    const channelsToSend =
        overrideChannels ||
        rules.defaultChannels ||
        ["inApp"];

    // --------------------------------------------------
    // Prevent duplicate active notification
    // --------------------------------------------------
    if (groupKey) {
        const existing = await Notification.findOne({
            user: user._id,
            groupKey,
            isDeleted: false
        });

        if (existing) {
            console.log("⚠ Notification skipped: already exists", existing._id);
            return existing;
        }
    }

    // --------------------------------------------------
    // Create base notification
    // --------------------------------------------------
    console.log("📝 Creating notification...", { type, title, message });

    const notification = await Notification.create({
        user: user._id,
        title,
        message,
        type,
        priority: finalPriority,
        actionUrl,
        metadata,
        groupKey,
        channels: buildChannelStatus(channelsToSend)
    });

    console.log("✅ Notification saved", notification._id);

    // --------------------------------------------------
    // Process channels asynchronously (non-blocking)
    // --------------------------------------------------
    processChannels({
        notification,
        user,
        type,
        channelsToSend,
        rules
    }).then(() => {
        console.log("🚀 Channel processing finished for notification:", notification._id);
    }).catch(err => {
        console.error("❌ Notification processing error:", err, "Notification ID:", notification._id);
    });

    return notification;
}

// --------------------------------------------------
// BUILD INITIAL CHANNEL STATE
// --------------------------------------------------

function buildChannelStatus(channels) {
    return {
        inApp: {
            status: channels.includes("inApp") ? "delivered" : "not_requested",
            deliveredAt: channels.includes("inApp") ? new Date() : undefined
        },
        email: {
            status: channels.includes("email") ? "pending" : "not_requested"
        },
        whatsapp: {
            status: channels.includes("whatsapp") ? "pending" : "not_requested"
        }
    };
}

// --------------------------------------------------
// CHANNEL PROCESSOR
// --------------------------------------------------

async function processChannels({ notification, user, type, channelsToSend, rules }) {
    console.log("📡 processChannels() called", { channelsToSend });

    // -------------------------
    // EMAIL
    // -------------------------
    if (channelsToSend.includes("email")) {
        try {
            console.log("📧 Sending email to:", user.email);
            const { subject, html, text } = getEmailTemplate(type, {
                user,
                ...notification.metadata
            });

            await emailService.sendEmail({
                to: user.email,
                subject,
                htmlContent: html,
                textContent: text,
                tags: [type]
            });

            notification.channels.email.status = "sent";
            notification.channels.email.sentAt = new Date();
            console.log("✅ Email sent successfully to:", user.email);

        } catch (err) {
            notification.channels.email.status = "failed";
            notification.channels.email.error = err.message;
            console.error("❌ Email failed for user:", user._id, err);

            // Escalate only if WhatsApp wasn't already requested
            if (rules.escalateToWhatsApp && !channelsToSend.includes("whatsapp")) {
                console.log("📲 Escalating to WhatsApp due to email failure");
                await sendWhatsApp(notification, user);
            }
        }
    }

    // -------------------------
    // WHATSAPP
    // -------------------------
    if (channelsToSend.includes("whatsapp")) {
        await sendWhatsApp(notification, user);
    }

    // Save once after processing
    await notification.save();
    console.log("💾 Notification updated after channel processing:", notification._id);
}

// --------------------------------------------------
// WHATSAPP SENDER
// --------------------------------------------------

async function sendWhatsApp(notification, user) {
    try {
        console.log("📲 Sending WhatsApp to:", user.phoneNumber);
        await whatsappService.send({
            user,
            notification
        });

        notification.channels.whatsapp.status = "sent";
        notification.channels.whatsapp.sentAt = new Date();
        console.log("✅ WhatsApp sent successfully to:", user.phoneNumber);

    } catch (err) {
        notification.channels.whatsapp.status = "failed";
        notification.channels.whatsapp.error = err.message;
        console.error("❌ WhatsApp failed for user:", user._id, err);
    }
}

module.exports = {
    notify
};
