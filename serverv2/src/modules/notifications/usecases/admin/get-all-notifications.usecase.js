export class GetAllNotifications {
	constructor({ notificationRepository }) {
		this.notificationRepository = notificationRepository;
	}
	async execute({ type, state, page = 1, limit = 20 } = {}) {
		const filter = {};
		if (type) filter.type = type;
		if (state) filter.state = state;
		return this.notificationRepository.paginate({ filter, page, limit, sort: { createdAt: -1 } });
	}
}