
// usecases/admin/get-all-tickets.usecase.js
export class GetAllTickets {
	constructor({ ticketRepository }) { this.ticketRepository = ticketRepository; }
	async execute({ status, priority, category, assignedToId, page = 1, limit = 20 } = {}) {
		const filter = {};
		if (status) filter.status = status;
		if (priority) filter.priority = priority;
		if (category) filter.category = category;
		if (assignedToId) filter.assignedToId = assignedToId;
		return this.ticketRepository.paginate({ filter, page, limit, sort: { priority: -1, updatedAt: 1 } });
	}
}