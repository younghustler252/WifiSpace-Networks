export const TICKET_STATUSES = { OPEN: "open", IN_PROGRESS: "in_progress", WAITING_ON_CUSTOMER: "waiting_on_customer", RESOLVED: "resolved", CLOSED: "closed" };
export const TICKET_STATUS_LIST = Object.values(TICKET_STATUSES);

export const TICKET_PRIORITIES = { LOW: "low", NORMAL: "normal", HIGH: "high", URGENT: "urgent" };
export const TICKET_PRIORITY_LIST = Object.values(TICKET_PRIORITIES);

export const TICKET_CATEGORIES = { BILLING: "billing", TECHNICAL: "technical", ACCOUNT: "account", OTHER: "other" };
export const TICKET_CATEGORY_LIST = Object.values(TICKET_CATEGORIES);

export const TICKET_ERROR_CODES = { TICKET_NOT_FOUND: "TICKET_NOT_FOUND", TICKET_CLOSED: "TICKET_CLOSED" };