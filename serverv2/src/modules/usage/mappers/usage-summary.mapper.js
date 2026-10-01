// mappers/usage-summary.mapper.js
import { UsageSummary } from "../domain/usage-summary.entity.js";
const FIELDS = ["totalBytesUsed", "totalSecondsUsed", "dataCapBytes", "durationSeconds", "lastSyncedAt"];

export class UsageSummaryMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, subscriptionId: raw.subscriptionId?.toString(), accountId: raw.accountId?.toString(), createdAt: raw.createdAt, updatedAt: raw.updatedAt };
		for (const f of FIELDS) data[f] = raw[f];
		return new UsageSummary(data);
	}
	static toPersistence(s) {
		const data = { subscriptionId: s.subscriptionId, accountId: s.accountId };
		for (const f of FIELDS) data[f] = s[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}