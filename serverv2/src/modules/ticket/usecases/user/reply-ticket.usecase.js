// usecases/user/reply-ticket.usecase.js — shared by customer and staff, authorRole derived from caller
import { NotFoundError, ForbiddenError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { TICKET_ERROR_CODES } from "../../domain/ticket.enum.js";

export class ReplyTicket {
	constructor({ ticketRepository, ticketMessageRepository }) {
		this.ticketRepository = ticketRepository;
		this.ticketMessageRepository = ticketMessageRepository;
	}

	async execute({ actorId, actorRole, ticketId, message }) {
		const { TicketMessage } = await import("../../domain/ticket-message.entity.js");
		const ticket = await this.ticketRepository.findById(ticketId);
		if (!ticket) throw new NotFoundError("Ticket not found", TICKET_ERROR_CODES.TICKET_NOT_FOUND);

		const isOwner = ticket.userId === actorId;
		const isStaff = ["staff", "superadmin"].includes(actorRole);
		if (!isOwner && !isStaff) throw new ForbiddenError("You do not have access to this ticket");
		if (ticket.isClosed()) throw new ValidationError("Cannot reply to a closed ticket", TICKET_ERROR_CODES.TICKET_CLOSED);

		const created = await this.ticketMessageRepository.create(new TicketMessage({ ticketId, authorId: actorId, authorRole: isStaff ? "staff" : "customer", message }));

		ticket.touch();
		if (isStaff && ticket.status === "open") ticket.setStatus("in_progress");
		if (isOwner && ticket.status === "waiting_on_customer") ticket.setStatus("in_progress");
		await this.ticketRepository.update(ticket.id, ticket);

		return created;
	}
}