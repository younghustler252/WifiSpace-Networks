// controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ getAllTickets, assignTicket, updateTicketStatus }) {
		this.getAllTicketsUseCase = getAllTickets; this.assignTicketUseCase = assignTicket; this.updateTicketStatusUseCase = updateTicketStatus;
	}
	getAllTickets = async (req, res) => { const { data, meta } = await this.getAllTicketsUseCase.execute({ ...req.query }); return paginatedResponse({ res, data: data.map((t) => t.toJSON()), meta, message: "Tickets fetched" }); };
	assign = async (req, res) => { const t = await this.assignTicketUseCase.execute({ actorId: req.user.id, ticketId: req.params.id, ...req.body, ip: req.ip }); return successResponse({ res, data: t.toJSON(), message: "Ticket assigned" }); };
	updateStatus = async (req, res) => { const t = await this.updateTicketStatusUseCase.execute({ actorId: req.user.id, ticketId: req.params.id, ...req.body, ip: req.ip }); return successResponse({ res, data: t.toJSON(), message: "Status updated" }); };
}