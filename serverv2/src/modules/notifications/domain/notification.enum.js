export const NOTIFICATION_TYPES = {
    ACCOUNT: "account",           // e.g., account suspended, activated
    SUBSCRIPTION: "subscription", // e.g., subscription expired, renewed
    USAGE: "usage",               // e.g., data limit reached
    PAYMENT: "payment",           // e.g., payment received, failed
    SYSTEM: "system"              // e.g., system maintenance
};

export const NOTIFICATION_STATUS = {
    UNREAD: "unread",
    READ: "read",
    FAILED: "failed",
    SENT: "sent"
};

export const NOTIFICATION_CHANNEL = {
    EMAIL: "email",
    WHATSAPP: "whatsapp",
    SMS: "sms" // we don't have it yet, but can add later
};