import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import accountModel from "../database/account.model.js";
import CounterModel from "../database/counter.model.js";

import { AccountRepository } from "../domain/account.repository.js";
import { AccountMapper } from "../mappers/account.mapper.js";

const USER_POPULATE = {
	path: "userId",
	select: "firstName lastName email avatar"
};

export class AccountRepositoryMongo extends BaseRepository {

	constructor() {
		super(accountModel, AccountMapper);
	}

	async create(accountEntity) {
		if (!accountEntity.wsnId) {
			const prefix = accountEntity.serviceType === "hotspot"
				? "HS"
				: "WSN";

			accountEntity.wsnId = await this.generateWsnId(prefix);
		}

		const account = await super.create(accountEntity);

		return this.findById(account.id);
	}

	async findById(id) {
		return super.findById(id, {
			populates: [USER_POPULATE]
		});
	}

	async findAll(query = {}, sort = {}, page = 1, limit = 20) {
		return this.paginate({
			filter: query,
			page,
			limit,
			sort,
			populates: [USER_POPULATE]
		});
	}


	async findOne(filters) {
		return super.findOne({
			filter: filters,
			populates: [USER_POPULATE]
		});
	}

	async findByWsnId(wsnId) {
		return super.findOne({
			filter: { wsnId },
			populates: [USER_POPULATE]
		});
	}

	async findByUserId(userId) {
		const docs = await accountModel
			.find({ userId })
			.populate(USER_POPULATE)
			.lean();

		return this.mapArray(docs);
	}

	async findByMac(macAddress) {
		const normalized = macAddress.toUpperCase().trim();

		const doc = await accountModel
			.findOne({
				"devices.macAddress": normalized,
				serviceType: "hotspot"
			})
			.populate(USER_POPULATE)
			.lean();

		return this.mapOne(doc);
	}

	async deleteById(id) {
		return this.delete(id);
	}

	async generateWsnId(prefix = "WSN") {
		const counter = await CounterModel.findOneAndUpdate(
			{ _id: `wsnId_${prefix}` },
			{ $inc: { sequence_value: 1 } },
			{
				returnDocument: "after",
				upsert: true
			}
		);

		return `${prefix}${String(counter.sequence_value).padStart(4, "0")}`;
	}

	async countAllAccounts() {
		return this.count();
	}

	async getDashboardStats() {
		const [stats] = await accountModel.aggregate([
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

		return (
			stats || {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0,
				pppoe: 0,
				hotspot: 0,
				personal: 0,
				business: 0
			}
		);
	}
}