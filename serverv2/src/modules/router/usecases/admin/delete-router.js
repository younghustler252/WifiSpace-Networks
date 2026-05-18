export class DeleteRouter {
	constructor(routerRepository, auditService) {
		this.routerRepository = routerRepository;
		this.auditService = auditService;
	}

	async execute(routerId) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new Error('Router not found');

		await this.routerRepository.delete(routerId);

		await this.auditService.log('delete-router', { routerId });

		return { success: true };
	}
}
