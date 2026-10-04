import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class TicketMessage {
	constructor({ id, ticketId, authorId, authorRole, message, attachments = [], createdAt = null }) {
		if (!ticketId) throw new ValidationError("ticketId is required");
		if (!authorId) throw new ValidationError("authorId is required");
		if (!message?.trim()) throw new ValidationError("Message cannot be empty");

		Object.assign(this, { id, ticketId, authorId, authorRole, message: message.trim(), attachments, createdAt });
	}

	toJSON() { return { ...this }; }
}