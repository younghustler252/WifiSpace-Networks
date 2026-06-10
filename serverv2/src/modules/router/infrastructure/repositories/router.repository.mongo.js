import RouterModel from "../database/mongoose/router.model.js";
import { RouterMapper } from "../../domain/router.mapper.js";
import { RouterRepository } from "../../domain/router.repository.js";
import { ROUTER_STATUSES } from "../../domain/router.enum.js";

export class RouterRepositoryMongo extends RouterRepository {

	// ==================================================
	// Create
	// ==================================================
	async create(routerEntity) {
		const data = RouterMapper.toPersistence(routerEntity);
		const router = await RouterModel.create(data);
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Find By ID
	// ==================================================
	async findById(id) {
		const router = await RouterModel.findById(id).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Find By Code
	// ==================================================
	async findByCode(code) {
		const router = await RouterModel.findOne({ code }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Find By Host
	// ==================================================
	async findByHost(host) {
		const router = await RouterModel.findOne({ host }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Default Router
	// ==================================================
	async findDefaultRouter() {
		const router = await RouterModel.findOne({
			isDefaultRouter: true,
			isEnabled: true,
			apiEnabled: true,
			status: ROUTER_STATUSES.ONLINE
		}).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Available Routers
	// ==================================================
	async findAvailableRouters() {
		const routers = await RouterModel.find({
			isEnabled: true,
			status: ROUTER_STATUSES.ONLINE
		}).sort({ priority: 1 });

		return RouterMapper.toEntities(routers);
	}

	// ==================================================
	// Provisionable Router
	// ==================================================
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

	// ==================================================
	// Update (SAFE VERSION)
	// ==================================================
	async update(id, data) {

		// 🔥 prevent domain leaks (important)
		delete data.routerType;

		const router = await RouterModel.findByIdAndUpdate(
			id,
			{ $set: data },
			{ new: true }
		).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Delete
	// ==================================================
	async delete(id) {
		await RouterModel.findByIdAndDelete(id);
	}

	// ==================================================
	// Find All
	// ==================================================
	async findAll() {
		const routers = await RouterModel.find().select("+password");
		return RouterMapper.toEntities(routers);
	}

	// ==================================================
	// Update Status
	// ==================================================
	async updateStatus(id, status, lastError = null) {
		const router = await RouterModel.findByIdAndUpdate(
			id,
			{
				status,
				lastError,
				lastSeenAt: new Date()
			},
			{ new: true }
		).select("+password");

		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Sessions
	// ==================================================
	async incrementSessions(id) {
		return RouterModel.findByIdAndUpdate(
			id,
			{ $inc: { currentSessions: 1 } }
		);
	}

	async decrementSessions(id) {
		return RouterModel.findByIdAndUpdate(
			id,
			{ $inc: { currentSessions: -1 } }
		);
	}

	// ==================================================
	// Identity lookups
	// ==================================================
	async findByRouterUid(routerUid) {
		const router = await RouterModel.findOne({ routerUid }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	async findByIdentity(identity) {
		const router = await RouterModel.findOne({ systemIdentity: identity }).select("+password");
		return router ? RouterMapper.toEntity(router) : null;
	}

	// ==================================================
	// Hotspot Router Resolution
	// ==================================================
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