// usecases/shared/get-ticket-by-id.usecase.js
import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { TICKET_ERROR_CODES } from "../../domain/ticket.enum.js";

export class GetTicketById {
	constructor({ ticketRepository, ticketMessageRepository }) {
		this.ticketRepository = ticketRepository;
		this.ticketMessageRepository = ticketMessageRepository;
	}
	async execute({ actorId, actorRole, ticketId }) {
		const ticket = await this.ticketRepository.findById(ticketId);
		if (!ticket) throw new NotFoundError("Ticket not found", TICKET_ERROR_CODES.TICKET_NOT_FOUND);

		const isStaff = ["staff", "superadmin"].includes(actorRole);
		if (!isStaff && ticket.userId !== actorId) throw new ForbiddenError("You do not have access to this ticket");

		const { data: messages } = await this.ticketMessageRepository.findByTicket(ticketId, { limit: 200 });
		return { ticket, messages };
	}
}