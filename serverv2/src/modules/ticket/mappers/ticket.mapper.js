// mappers/ticket.mapper.js
import { Ticket } from "../domain/ticket.entity.js";
const FIELDS = ["userId", "accountId", "assignedToId", "category", "priority", "status", "subject", "lastMessageAt", "resolvedAt", "closedAt"];

export class TicketMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt };
		for (const f of FIELDS) data[f] = raw[f];
		data.userId = raw.userId?.toString();
		data.accountId = raw.accountId?.toString() ?? null;
		data.assignedToId = raw.assignedToId?.toString() ?? null;
		return new Ticket(data);
	}
	static toPersistence(t) {
		const data = {};
		for (const f of FIELDS) data[f] = t[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}