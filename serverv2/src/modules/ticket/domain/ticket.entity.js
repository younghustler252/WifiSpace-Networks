import { TICKET_STATUSES, TICKET_STATUS_LIST, TICKET_PRIORITIES, TICKET_PRIORITY_LIST, TICKET_CATEGORY_LIST } from "./ticket.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Ticket {
	constructor({
		id, userId, accountId = null, assignedToId = null,
		category, priority = TICKET_PRIORITIES.NORMAL, status = TICKET_STATUSES.OPEN,
		subject, lastMessageAt = null, resolvedAt = null, closedAt = null,
		createdAt = null, updatedAt = null
	}) {
		if (!userId) throw new ValidationError("userId is required");
		if (!TICKET_CATEGORY_LIST.includes(category)) throw new ValidationError("Invalid ticket category");
		if (!TICKET_PRIORITY_LIST.includes(priority)) throw new ValidationError("Invalid ticket priority");
		if (!TICKET_STATUS_LIST.includes(status)) throw new ValidationError("Invalid ticket status");
		if (!subject?.trim()) throw new ValidationError("Subject is required");

		Object.assign(this, { id, userId, accountId, assignedToId, category, priority, status, subject: subject.trim(), lastMessageAt, resolvedAt, closedAt, createdAt, updatedAt });
	}

	assign(staffId) { this.assignedToId = staffId; if (this.status === TICKET_STATUSES.OPEN) this.status = TICKET_STATUSES.IN_PROGRESS; }
	setStatus(status) {
		if (!TICKET_STATUS_LIST.includes(status)) throw new ValidationError("Invalid ticket status");
		this.status = status;
		if (status === TICKET_STATUSES.RESOLVED) this.resolvedAt = new Date();
		if (status === TICKET_STATUSES.CLOSED) this.closedAt = new Date();
	}
	touch() { this.lastMessageAt = new Date(); }
	isClosed() { return this.status === TICKET_STATUSES.CLOSED; }

	toJSON() { return { ...this }; }
}