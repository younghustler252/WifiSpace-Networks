import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import RouterModel from "../database/router.model.js";
import { RouterMapper } from "../mappers/router.mapper.js";
import { ROUTER_STATUSES } from "../domain/router.enum.js";

export class RouterRepositoryMongo extends BaseRepository {
	constructor({ credentialCipherService }) {
		super(RouterModel, RouterMapper);
		this.credentialCipherService = credentialCipherService;
	}

	async create(routerEntity) {
		const data = RouterMapper.toPersistence(routerEntity);
		if (data.password) {
			data.passwordEncrypted = this.credentialCipherService.encrypt(data.password);
			delete data.password;
		}
		const doc = await this.model.create(data);
		return this.findById(doc._id);
	}

	async findById(id) {
		const doc = await this.model.findById(id).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findByCode(code) {
		const doc = await this.model.findOne({ code }).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findByHost(host) {
		const doc = await this.model.findOne({ host }).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findByRouterUid(routerUid) {
		const doc = await this.model.findOne({ routerUid }).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findByIdentity(identity) {
		const doc = await this.model.findOne({ systemIdentity: identity }).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findDefaultRouter() {
		const doc = await this.model.findOne({
			isDefaultRouter: true, isEnabled: true, apiEnabled: true, status: ROUTER_STATUSES.ONLINE
		}).select("+passwordEncrypted").lean();
		return this._mapWithCredentials(doc);
	}

	async findAvailableRouters() {
		const docs = await this.model.find({ isEnabled: true, status: ROUTER_STATUSES.ONLINE }).sort({ priority: 1 }).lean();
		return this.mapArray(docs);
	}

	async findProvisionableRouter(service) {
		const doc = await this.model
			.findOne({ isEnabled: true, apiEnabled: true, status: ROUTER_STATUSES.ONLINE, supportedServices: service })
			.sort({ currentSessions: 1, priority: 1 })
			.select("+passwordEncrypted")
			.lean();
		return this._mapWithCredentials(doc);
	}

	async findRouterForHotspot({ routerId, routerUid, identity }) {
		if (routerId) { const r = await this.findById(routerId); if (r) return r; }
		if (routerUid) { const r = await this.findByRouterUid(routerUid); if (r) return r; }
		if (identity) { const r = await this.findByIdentity(identity); if (r) return r; }
		return this.findDefaultRouter();
	}

	async update(id, entityOrData) {
		const data = RouterMapper.toPersistence(entityOrData);
		if (data.password) {
			data.passwordEncrypted = this.credentialCipherService.encrypt(data.password);
			delete data.password;
		}
		await this.model.findByIdAndUpdate(id, data, { new: true });
		return this.findById(id);
	}

	async updateStatus(id, status, lastError = null) {
		await this.model.findByIdAndUpdate(id, { status, lastError, lastSeenAt: new Date() });
		return this.findById(id);
	}

	async incrementSessions(id) {
		return this.model.findByIdAndUpdate(id, { $inc: { currentSessions: 1 } });
	}

	async decrementSessions(id) {
		return this.model.findByIdAndUpdate(id, { $inc: { currentSessions: -1 } });
	}

	// Only place a decrypted, connectable router credential should ever be constructed.
	_mapWithCredentials(doc) {
		if (!doc) return null;
		const router = this.mapOne({ ...doc, passwordEncrypted: undefined });
		router.password = doc.passwordEncrypted ? this.credentialCipherService.decrypt(doc.passwordEncrypted) : null;
		return router;
	}
}