// mappers/ticket-message.mapper.js
import { TicketMessage } from "../domain/ticket-message.entity.js";

export class TicketMessageMapper {
	static toDomain(raw) {
		if (!raw) return null;
		return new TicketMessage({
			id: raw._id?.toString() || raw.id, ticketId: raw.ticketId?.toString(), authorId: raw.authorId?.toString(),
			authorRole: raw.authorRole, message: raw.message, attachments: raw.attachments, createdAt: raw.createdAt
		});
	}
	static toPersistence(m) {
		return { ticketId: m.ticketId, authorId: m.authorId, authorRole: m.authorRole, message: m.message, attachments: m.attachments };
	}
}