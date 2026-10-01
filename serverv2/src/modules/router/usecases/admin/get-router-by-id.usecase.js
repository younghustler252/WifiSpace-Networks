import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class GetRouterById {
	constructor({ routerRepository }) {
		this.routerRepository = routerRepository;
	}
	async execute({ routerId }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);
		return router;
	}
}