export class GetAllRouters {
	constructor({ routerRepository }) {
		this.routerRepository = routerRepository;
	}
	async execute({ status, connectionType, page = 1, limit = 20 } = {}) {
		const filter = {};
		if (status) filter.status = status;
		if (connectionType) filter.connectionType = connectionType;
		return this.routerRepository.paginate({ filter, page, limit, sort: { priority: 1 } });
	}
}