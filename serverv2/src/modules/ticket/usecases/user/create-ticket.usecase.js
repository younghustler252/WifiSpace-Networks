// usecases/user/create-ticket.usecase.js
import { Ticket } from "../../domain/ticket.entity.js";
import { TicketMessage } from "../../domain/ticket-message.entity.js";

export class CreateTicket {
	constructor({ ticketRepository, ticketMessageRepository, auditService }) {
		this.ticketRepository = ticketRepository;
		this.ticketMessageRepository = ticketMessageRepository;
		this.auditService = auditService;
	}

	async execute({ userId, accountId = null, category, priority, subject, message, ip = null }) {
		const ticket = new Ticket({ userId, accountId, category, priority, subject });
		let created = await this.ticketRepository.create(ticket);

		await this.ticketMessageRepository.create(new TicketMessage({ ticketId: created.id, authorId: userId, authorRole: "customer", message }));
		created.touch();
		created = await this.ticketRepository.update(created.id, created);

		if (this.auditService) {
			await this.auditService.log({ actorId: userId, action: "TICKET_CREATED", entity: "Ticket", entityId: created.id, newValue: { category, priority, subject }, ip });
		}

		return created;
	}
}