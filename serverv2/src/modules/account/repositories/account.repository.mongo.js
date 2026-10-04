import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import AccountModel from "../database/account.model.js";
import { PppoeAccountModel } from "../database/pppoe-account.model.js";
import { HotspotAccountModel } from "../database/hotspot-account.model.js";
import CounterModel from "../database/counter.model.js";

import { AccountMapper } from "../mappers/account.mapper.js";
import { SERVICE_TYPES } from "../domain/account.enum.js";

const USER_POPULATE = { path: "userId", select: "firstName lastName email avatar phone address" };
const NOT_DELETED = { deletedAt: null };

const MODEL_BY_TYPE = {
	[SERVICE_TYPES.PPPOE]: PppoeAccountModel,
	[SERVICE_TYPES.HOTSPOT]: HotspotAccountModel
};

export class AccountRepositoryMongo extends BaseRepository {
	constructor({ credentialCipherService }) {
		super(AccountModel, AccountMapper);
		this.credentialCipherService = credentialCipherService;
	}

	_modelFor(serviceType) {
		const model = MODEL_BY_TYPE[serviceType];
		if (!model) throw new Error(`Unknown service type: ${serviceType}`);
		return model;
	}

	async create(accountEntity) {
		if (!accountEntity.wsnId) {
			const prefix = accountEntity.serviceType === SERVICE_TYPES.HOTSPOT ? "HS" : "WSN";
			accountEntity.wsnId = await this.generateWsnId(prefix);
		}

		const persistence = AccountMapper.toPersistence(accountEntity);

		if (persistence.routerPassword) {
			persistence.routerPasswordEncrypted = this.credentialCipherService.encrypt(persistence.routerPassword);
			delete persistence.routerPassword;
		}

		const Model = this._modelFor(accountEntity.serviceType);
		const created = await Model.create(persistence);

		return this.findById(created._id);
	}

	async findById(id, { includeDeleted = false } = {}) {
		const doc = await this.model
			.findOne({ _id: id, ...(includeDeleted ? {} : NOT_DELETED) })
			.populate(USER_POPULATE)
			.lean();

		return this.mapOne(doc);
	}

	async paginate(opts = {}) {
		const { filter = {}, includeDeleted = false, ...rest } = opts;
		return super.paginate({
			...rest,
			filter: { ...filter, ...(includeDeleted ? {} : NOT_DELETED) },
			populates: [USER_POPULATE]
		});
	}

	async findOne(filters, { includeDeleted = false } = {}) {
		return super.findOne({
			filter: { ...filters, ...(includeDeleted ? {} : NOT_DELETED) },
			populates: [USER_POPULATE]
		});
	}

	async findByWsnId(wsnId) {
		return super.findOne({ filter: { wsnId, ...NOT_DELETED }, populates: [USER_POPULATE] });
	}

	async findByUserId(userId) {
		const docs = await this.model.find({ userId, ...NOT_DELETED }).populate(USER_POPULATE).lean();
		return this.mapArray(docs);
	}

	async findByMac(macAddress) {
		const normalized = macAddress.toUpperCase().trim();
		const doc = await this.model
			.findOne({ "devices.macAddress": normalized, serviceType: SERVICE_TYPES.HOTSPOT, ...NOT_DELETED })
			.populate(USER_POPULATE)
			.lean();
		return this.mapOne(doc);
	}

	async update(id, entityOrData) {
		const persistence = AccountMapper.toPersistence(entityOrData);

		if (persistence.routerPassword) {
			persistence.routerPasswordEncrypted = this.credentialCipherService.encrypt(persistence.routerPassword);
			delete persistence.routerPassword;
		}

		await this.model.findByIdAndUpdate(id, persistence, { new: true });
		return this.findById(id, { includeDeleted: true }); // caller may be re-reading right after a soft delete
	}

	async findRouterCredentials(id) {
		const doc = await PppoeAccountModel.findById(id).select("+routerPasswordEncrypted").lean();
		if (!doc) return null;

		return {
			id: doc._id.toString(),
			routerId: doc.routerId?.toString(),
			routerProfile: doc.routerProfile,
			routerPassword: this.credentialCipherService.decrypt(doc.routerPasswordEncrypted)
		};
	}

	async generateWsnId(prefix = "WSN") {
		const counter = await CounterModel.findOneAndUpdate(
			{ _id: `wsnId_${prefix}` },
			{ $inc: { sequence_value: 1 } },
			{ returnDocument: "after", upsert: true }
		);
		return `${prefix}${String(counter.sequence_value).padStart(4, "0")}`;
	}

	async countAllAccounts() {
		return this.count(NOT_DELETED);
	}

	async getDashboardStats() {
		const [stats] = await this.model.aggregate([
			{ $match: NOT_DELETED },
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					pending: { $sum: { $cond: [{ $eq: ["$approvalStatus", "pending"] }, 1, 0] } },
					approved: { $sum: { $cond: [{ $eq: ["$approvalStatus", "approved"] }, 1, 0] } },
					rejected: { $sum: { $cond: [{ $eq: ["$approvalStatus", "rejected"] }, 1, 0] } },
					pppoe: { $sum: { $cond: [{ $eq: ["$serviceType", "pppoe"] }, 1, 0] } },
					hotspot: { $sum: { $cond: [{ $eq: ["$serviceType", "hotspot"] }, 1, 0] } },
					personal: { $sum: { $cond: [{ $eq: ["$accountType", "personal"] }, 1, 0] } },
					business: { $sum: { $cond: [{ $eq: ["$accountType", "business"] }, 1, 0] } }
				}
			}
		]);

		return stats || { total: 0, pending: 0, approved: 0, rejected: 0, pppoe: 0, hotspot: 0, personal: 0, business: 0 };
	}
}