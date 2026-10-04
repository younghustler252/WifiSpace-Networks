// repositories/ticket.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import TicketModel from "../database/ticket.model.js";
import { TicketMapper } from "../mappers/ticket.mapper.js";

export class TicketRepositoryMongo extends BaseRepository {
	constructor() { super(TicketModel, TicketMapper); }
	async update(id, entityOrData) {
		await this.model.findByIdAndUpdate(id, TicketMapper.toPersistence(entityOrData), { new: true });
		return this.findById(id);
	}
}