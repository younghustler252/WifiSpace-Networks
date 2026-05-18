// ==================================
// Payment Constants (ENUMS)
// ==================================

export const PAYMENT_STATUSES = [
    "initiated",  // new
    "pending",    // in progress
    "successful",
    "failed",
    "expired"
];

export const PAYMENT_CHANNELS = [
    "card",
    "bank_transfer",
    "ussd",
    "cash"
];

export const PAYMENT_ACTIONS = [
    "new_subscription",
    "renewal",
    "upgrade",
   
];

export const PAYMENT_GATEWAYS = [
    "paystack",
    "manual"
];