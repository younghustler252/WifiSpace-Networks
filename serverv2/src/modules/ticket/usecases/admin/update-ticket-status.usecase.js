export class UpdateTicketStatus {
    constructor({ ticketRepository, auditService }) { this.ticketRepository = ticketRepository; this.auditService = auditService; }
    async execute({ actorId, ticketId, status, ip = null }) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) throw new NotFoundError("Ticket not found", TICKET_ERROR_CODES.TICKET_NOT_FOUND);
        const previous = ticket.status;
        ticket.setStatus(status);
        const updated = await this.ticketRepository.update(ticket.id, ticket);
        if (this.auditService) await this.auditService.log({ actorId, action: "TICKET_STATUS_UPDATED", entity: "Ticket", entityId: ticketId, oldValue: { status: previous }, newValue: { status }, ip });
        return updated;
    }
}