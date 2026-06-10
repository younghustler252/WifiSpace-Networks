// domain/notification.enum.js

// ================= TYPES =================

export const NOTIFICATION_TYPES = {

    ACCOUNT: "account",

    SUBSCRIPTION: "subscription",

    USAGE: "usage",

    PAYMENT: "payment",

    SYSTEM: "system",

    SECURITY: "security",

    OTP: "otp",

    SUPPORT: "support",

    OUTAGE: "outage",

    MAINTENANCE: "maintenance"
};


// ================= NOTIFICATION LIFECYCLE =================

export const NOTIFICATION_STATE = {

    DRAFT: "draft",

    QUEUED: "queued",

    PROCESSING: "processing",

    COMPLETED: "completed",

    CANCELLED: "cancelled"
};


// ================= RECIPIENT DELIVERY STATUS =================

export const NOTIFICATION_RECIPIENT_STATUS = {

    PENDING: "pending",

    QUEUED: "queued",

    SENT: "sent",

    DELIVERED: "delivered",

    READ: "read",

    FAILED: "failed",

    CANCELLED: "cancelled"
};


// ================= CHANNELS =================

export const NOTIFICATION_CHANNEL = {

    EMAIL: "email",

    WHATSAPP: "whatsapp",

    SMS: "sms",

    PUSH: "push",

    IN_APP: "in_app"
};


// ================= PRIORITY =================

export const NOTIFICATION_PRIORITY = {

    LOW: "low",

    NORMAL: "normal",

    HIGH: "high",

    CRITICAL: "critical"
};