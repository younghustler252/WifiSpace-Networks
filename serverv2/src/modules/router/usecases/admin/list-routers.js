export class ListRouters {
	constructor({routerRepository}) {
		this.routerRepository = routerRepository;
	}

	async execute() {
		return this.routerRepository.findAll();
	}
}