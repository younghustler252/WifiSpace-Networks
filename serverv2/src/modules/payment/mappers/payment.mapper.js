import { Payment } from "../domain/payment.entity.js";
import { PAYMENT_CHANNEL_LIST } from "../domain/payment.enum.js";

const FIELDS = [
    "userId", "accountId", "subscriptionId", "planId", "actionType",
    "amount", "cycles", "currency", "paymentChannel", "gateway",
    "gatewayReference", "status", "businessProcessed", "processedAt",
    "failedAt", "failureReason", "idempotencyKey", "paymentDate", "metadata"
];

export class PaymentMapper {
    static toDomain(raw) {
        if (!raw) return null;

        const data = { id: raw._id?.toString() || raw.id };

        for (const f of FIELDS) {
            data[f] = raw[f];
        }

        data.paymentChannel = PAYMENT_CHANNEL_LIST.includes(raw.paymentChannel)
            ? raw.paymentChannel
            : null;

        data.accountId =
            raw.accountId?._id?.toString() ||
            raw.accountId?.toString() ||
            null;

        data.account =
            raw.accountId && typeof raw.accountId === "object"
                ? raw.accountId
                : null;

        data.planId =
            raw.planId?._id?.toString() ||
            raw.planId?.toString() ||
            null;

        data.plan =
            raw.planId && typeof raw.planId === "object"
                ? raw.planId
                : null;

        const rawUserId = raw.userId ?? raw.user;

        data.userId =
            rawUserId?._id?.toString() ||
            (typeof rawUserId === "string"
                ? rawUserId
                : rawUserId?.toString()) ||
            null;

        data.user =
            rawUserId && typeof rawUserId === "object"
                ? rawUserId
                : null;

        data.subscriptionId =
            raw.subscriptionId?._id?.toString() ||
            raw.subscriptionId?.toString() ||
            null;

        data.createdAt = raw.createdAt;
        data.updatedAt = raw.updatedAt;

        if (!data.userId) {
            throw new Error(
                `PaymentMapper: missing userId for payment ${data.id}`
            );
        }

        return new Payment(data);
    }

    static toPersistence(payment) {
        const data = {};

        for (const f of FIELDS) {
            data[f] = payment[f];
        }

        return Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        );
    }
}