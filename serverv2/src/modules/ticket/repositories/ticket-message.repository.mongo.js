// repositories/ticket-message.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import TicketMessageModel from "../database/ticket-message.model.js";
import { TicketMessageMapper } from "../mappers/ticket-message.mapper.js";

export class TicketMessageRepositoryMongo extends BaseRepository {
	constructor() { super(TicketMessageModel, TicketMessageMapper); }
	async findByTicket(ticketId, { page = 1, limit = 50 } = {}) {
		return this.paginate({ filter: { ticketId }, page, limit, sort: { createdAt: 1 } });
	}
}