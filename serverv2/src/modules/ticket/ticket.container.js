// ticket.container.js
import { asClass } from "awilix";

import { TicketRepositoryMongo } from "./repositories/ticket.repository.mongo.js";
import { TicketMessageRepositoryMongo } from "./repositories/ticket-message.repository.mongo.js";

import { CreateTicket } from "./usecases/user/create-ticket.usecase.js";
import { ReplyTicket } from "./usecases/user/reply-ticket.usecase.js";
import { GetMyTickets } from "./usecases/user/get-my-tickets.usecase.js";
import { GetTicketById } from "./usecases/user/get-ticket-by-id.usecase.js";

import { GetAllTickets } from "./usecases/admin/get-all-tickets.usecase.js";
import { AssignTicket } from "./usecases/admin/assign-ticket.usecase.js";
import { UpdateTicketStatus } from "./usecases/admin/update-ticket-status.usecase.js";

import { TicketController } from "./controllers/ticket.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerTicket(container) {
	container.register({
		ticketRepository: asClass(TicketRepositoryMongo).singleton(),
		ticketMessageRepository: asClass(TicketMessageRepositoryMongo).singleton(),
        
		createTicket: asClass(CreateTicket).scoped(),
		replyTicket: asClass(ReplyTicket).scoped(),
		getMyTickets: asClass(GetMyTickets).scoped(),
		getTicketById: asClass(GetTicketById).scoped(),

		getAllTickets: asClass(GetAllTickets).scoped(),
		assignTicket: asClass(AssignTicket).scoped(),
		updateTicketStatus: asClass(UpdateTicketStatus).scoped(),

		ticketController: asClass(TicketController).scoped(),
		ticketAdminController: asClass(AdminController).scoped()
	});
}
