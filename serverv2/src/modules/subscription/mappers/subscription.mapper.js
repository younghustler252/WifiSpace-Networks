// mappers/subscription.mapper.js
import { Subscription } from "../domain/subscription.entity.js";

const FIELDS = [
	"accountId", "userId", "planId", "status", "planSnapshot", "cycles", "totalAmount",
	"startsAt", "expiresAt", "graceEndsAt", "activatedAt", "expiredAt", "currentPeriodStart", "currentPeriodEnd",
	"renewalStrategy", "autoRenewEnabled", "nextRenewalDate", "lastRenewedAt",
	"lastPaymentDate", "lastPaymentAmount", "suspendedAt", "totalSuspendedDuration", "suspensionReason",
	"canceledAt", "cancellationReason", "bonusDays", "manualAdjustmentDays",
	"mikrotikStatus", "mikrotikLastSyncAt", "mikrotikError", "remindersSent", "events"
];

export class SubscriptionMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, lastPaymentId: raw.lastPaymentId?.toString() ?? null };
		for (const f of FIELDS) data[f] = raw[f];
		data.accountId = raw.accountId?.toString();
		data.userId = raw.userId?.toString();
		data.planId = raw.planId?.toString();
		return new Subscription(data);
	}

	static toPersistence(sub) {
		const data = { lastPaymentId: sub.lastPaymentId };
		for (const f of FIELDS) data[f] = sub[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}