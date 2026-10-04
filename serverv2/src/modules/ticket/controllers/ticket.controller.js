// controllers/ticket.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class TicketController {
	constructor({ createTicket, replyTicket, getMyTickets, getTicketById }) {
		this.createTicketUseCase = createTicket; this.replyTicketUseCase = replyTicket;
		this.getMyTicketsUseCase = getMyTickets; this.getTicketByIdUseCase = getTicketById;
	}
	createTicket = async (req, res) => { const t = await this.createTicketUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip }); return successResponse({ res, data: t.toJSON(), message: "Ticket created", statusCode: 201 }); };
	reply = async (req, res) => { const m = await this.replyTicketUseCase.execute({ actorId: req.user.id, actorRole: req.user.role, ticketId: req.params.id, message: req.body.message }); return successResponse({ res, data: m.toJSON(), message: "Reply posted" }); };
	getMyTickets = async (req, res) => { const { data, meta } = await this.getMyTicketsUseCase.execute({ userId: req.user.id, ...req.query }); return paginatedResponse({ res, data: data.map((t) => t.toJSON()), meta, message: "Tickets fetched" }); };
	getTicketById = async (req, res) => { const r = await this.getTicketByIdUseCase.execute({ actorId: req.user.id, actorRole: req.user.role, ticketId: req.params.id }); return successResponse({ res, data: { ticket: r.ticket.toJSON(), messages: r.messages.map((m) => m.toJSON()) }, message: "Ticket fetched" }); };
}