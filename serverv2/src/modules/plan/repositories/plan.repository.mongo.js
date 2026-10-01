import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import PlanModel from "../database/plan.model.js";
import { PlanMapper } from "../mappers/plan.mapper.js";

const NOT_DELETED = { deletedAt: null };

export class PlanRepositoryMongo extends BaseRepository {
	constructor() {
		super(PlanModel, PlanMapper);
	}

	async findById(id, { includeDeleted = false } = {}) {
		return super.findById(id, includeDeleted ? {} : { filter: NOT_DELETED });
	}

	// BaseRepository.findById doesn't accept a filter merge, so query directly here for the excluded case
	async findByIdOrNull(id, { includeDeleted = false } = {}) {
		if (!this.isValidId(id)) return null;
		const doc = await this.model.findOne({ _id: id, ...(includeDeleted ? {} : NOT_DELETED) }).lean();
		return this.mapOne(doc);
	}

	async findByNameAndServiceType(name, serviceType) {
		return this.findOne({ filter: { name, serviceType, ...NOT_DELETED } });
	}

	async paginate(opts = {}) {
		const { filter = {}, includeDeleted = false, ...rest } = opts;
		return super.paginate({ ...rest, filter: { ...filter, ...(includeDeleted ? {} : NOT_DELETED) } });
	}

	async update(id, entityOrData) {
		const persistence = PlanMapper.toPersistence(entityOrData);
		await this.model.findByIdAndUpdate(id, persistence, { new: true });
		return this.findByIdOrNull(id, { includeDeleted: true });
	}
}