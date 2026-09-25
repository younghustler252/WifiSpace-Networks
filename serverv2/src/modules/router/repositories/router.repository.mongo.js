import RouterModel from "../database/router.model.js";
import { RouterMapper } from "../mappers/router.mapper.js";
import { RouterRepository } from "./router.repository.js";
import { ROUTER_STATUSES } from "../domain/router.enum.js";

export class RouterRepositoryMongo extends RouterRepository {

	async create(routerEntity) {
		const data = RouterMapper.toPersistence(routerEntity);
		const router = await RouterModel.create(data);
		return RouterMapper.toEntity(router);
	}

	async findById(id) {
		const router = await RouterModel.findById(id).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findByCode(code) {
		const router = await RouterModel.findOne({ code }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findByHost(host) {
		const router = await RouterModel.findOne({ host }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findDefaultRouter() {
		const router = await RouterModel.findOne({
			isDefaultRouter: true,
			isEnabled: true,
			apiEnabled: true,
			status: ROUTER_STATUSES.ONLINE
		}).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	async findAvailableRouters() {
		const routers = await RouterModel.find({
			isEnabled: true,
			status: ROUTER_STATUSES.ONLINE
		}).sort({ priority: 1 });

		return RouterMapper.toEntities(routers);
	}

	async findProvisionableRouter(service) {
		const router = await RouterModel.findOne({
			isEnabled: true,
			apiEnabled: true,
			status: ROUTER_STATUSES.ONLINE,
			supportedServices: service
		})
			.sort({ currentSessions: 1, priority: 1 })
			.select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	async update(id, data) {
		
		const router = await RouterModel.findByIdAndUpdate(
			id,
			{ $set: data },
			{ new: true }
		).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	async delete(id) {
		await RouterModel.findByIdAndDelete(id);
	}

	async findAll() {
		const routers = await RouterModel.find().select("+password");
		return RouterMapper.toEntities(routers);
	}

	async updateStatus(id, status, lastError = null) {
		const router = await RouterModel.findByIdAndUpdate(
			id,
			{ status, lastError, lastSeenAt: new Date() },
			{ new: true }
		).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	async incrementSessions(id) {
		return RouterModel.findByIdAndUpdate(id, { $inc: { currentSessions: 1 } });
	}

	async decrementSessions(id) {
		return RouterModel.findByIdAndUpdate(id, { $inc: { currentSessions: -1 } });
	}
	

	async findByRouterUid(routerUid) {
		const router = await RouterModel.findOne({ routerUid }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findByIdentity(identity) {
		const router = await RouterModel.findOne({ systemIdentity: identity }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findRouterForHotspot({ routerId, routerUid, identity }) {
		if (routerId) {
			const r = await this.findById(routerId);
			if (r) return r;
		}
		if (routerUid) {
			const r = await this.findByRouterUid(routerUid);
			if (r) return r;
		}
		if (identity) {
			const r = await this.findByIdentity(identity);
			if (r) return r;
		}
		return this.findDefaultRouter();
	}
}