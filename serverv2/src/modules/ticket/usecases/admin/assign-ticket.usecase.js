// usecases/admin/assign-ticket.usecase.js + update-ticket-status.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { TICKET_ERROR_CODES } from "../../domain/ticket.enum.js";

export class AssignTicket {
	constructor({ ticketRepository, auditService }) { this.ticketRepository = ticketRepository; this.auditService = auditService; }
	async execute({ actorId, ticketId, staffId, ip = null }) {
		const ticket = await this.ticketRepository.findById(ticketId);
		if (!ticket) throw new NotFoundError("Ticket not found", TICKET_ERROR_CODES.TICKET_NOT_FOUND);
		ticket.assign(staffId);
		const updated = await this.ticketRepository.update(ticket.id, ticket);
		if (this.auditService) await this.auditService.log({ actorId, action: "TICKET_ASSIGNED", entity: "Ticket", entityId: ticketId, newValue: { staffId }, ip });
		return updated;
	}
}
