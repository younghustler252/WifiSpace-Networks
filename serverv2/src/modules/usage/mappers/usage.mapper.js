// mappers/usage.mapper.js
import { Usage } from "../domain/usage.entity.js";
const FIELDS = ["subscriptionId", "accountId", "routerId", "macAddress", "bytesUsed", "secondsUsed", "source", "recordedAt", "metadata"];

export class UsageMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, createdAt: raw.createdAt };
		for (const f of FIELDS) data[f] = raw[f];
		data.subscriptionId = raw.subscriptionId?.toString();
		data.accountId = raw.accountId?.toString();
		data.routerId = raw.routerId?.toString() ?? null;
		return new Usage(data);
	}
	static toPersistence(u) {
		const data = {};
		for (const f of FIELDS) data[f] = u[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}