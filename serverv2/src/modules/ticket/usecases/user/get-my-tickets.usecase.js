// usecases/user/get-my-tickets.usecase.js
export class GetMyTickets {
	constructor({ ticketRepository }) { this.ticketRepository = ticketRepository; }
	async execute({ userId, status, page = 1, limit = 20 }) {
		return this.ticketRepository.paginate({ filter: { userId, status }, page, limit, sort: { updatedAt: -1 } });
	}
}