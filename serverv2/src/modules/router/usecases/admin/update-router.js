export class UpdateRouter {
	constructor(routerRepository, auditService) {
		this.routerRepository = routerRepository;
		this.auditService = auditService;
	}

	async execute(routerId, updateData) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new Error('Router not found');

		const updated = await this.routerRepository.update(routerId, updateData);

		await this.auditService.log('update-router', { routerId });

		return updated;
	}
}