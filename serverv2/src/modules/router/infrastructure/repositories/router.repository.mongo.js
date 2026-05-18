import RouterModel from "../database/mongoose/router.model.js"; 
import { RouterMapper } from "../../domain/router.mapper.js";
import { RouterRepository } from "../../domain/router.repository.js";
import { ROUTER_STATUSES, ROUTER_TYPES } from "../../domain/router.enum.js";
import mongoose from "mongoose";

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
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Find By Code
	// ==================================================
	async findByCode(code) {
		const router = await RouterModel.findOne({ code }).select("+password");
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Find By Host
	// ==================================================
	async findByHost(host) {
		const router = await RouterModel.findOne({ host }).select("+password");
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Find Default Router
	// ==================================================
	async findDefaultRouter() {
		const router = await RouterModel.findOne({ isDefaultRouter: true, isEnabled: true })
			.sort({ priority: 1 })
			.select("+password");
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Find Available Routers
	// ==================================================
	async findAvailableRouters() {
		const routers = await RouterModel.find({ isEnabled: true, status: ROUTER_STATUSES.ONLINE })
			.sort({ priority: 1 })
			.select("+password");
		return RouterMapper.toEntities(routers);
	}

	// ==================================================
	// Find Provisionable Router
	// ==================================================
	async findProvisionableRouter(type) {
		const query = { isEnabled: true, apiEnabled: true, status: ROUTER_STATUSES.ONLINE };

		if (type === ROUTER_TYPES.PPPOE) {
			query.routerType = { $in: [ROUTER_TYPES.PPPOE, ROUTER_TYPES.MIXED] };
		} else if (type === ROUTER_TYPES.HOTSPOT) {
			query.routerType = { $in: [ROUTER_TYPES.HOTSPOT, ROUTER_TYPES.MIXED] };
		}

		const router = await RouterModel.findOne(query)
			.sort({ currentSessions: 1, priority: 1 })
			.select("+password");

		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Update
	// ==================================================
	async update(routerEntity) {
		const data = RouterMapper.toPersistence(routerEntity);
		const router = await RouterModel.findByIdAndUpdate(
			routerEntity.id,
			data,
			{ returnDocument: 'after' } // <-- FIX: use returnDocument instead of `new`
		).select("+password");
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Delete
	// ==================================================
	async delete(id) {
		await RouterModel.findByIdAndDelete(id);
	}

	// ==================================================
	// Find All Routers
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
			{ status, lastError, lastSeenAt: new Date() },
			{ returnDocument: 'after' } // <-- FIX
		).select("+password");
		return RouterMapper.toEntity(router);
	}

	// ==================================================
	// Increment Sessions
	// ==================================================
	async incrementSessions(id) {
		await RouterModel.findByIdAndUpdate(
			id,
			{ $inc: { currentSessions: 1 } },
			{ returnDocument: 'after' } // optional, but consistent
		);
	}

	// ==================================================
	// Decrement Sessions
	// ==================================================
	async decrementSessions(id) {
		await RouterModel.findByIdAndUpdate(
			id,
			{ $inc: { currentSessions: -1 } },
			{ returnDocument: 'after' } // optional
		);
	}
}