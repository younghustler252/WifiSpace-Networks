import planModel from "../database/moongoose/plan.model.js";

import { PlanRepository } from "../../domain/plan.repository.js";

import { PlanMapper } from "../mappers/plan.mapper.js";

export class PlanRepositoryMongo extends PlanRepository {

	// -----------------------------
	// CREATE
	// -----------------------------

	async create(planEntity) {

		const rawData =
			PlanMapper.toPersistence(planEntity);

		const createdPlan =
			await planModel.create(rawData);

		return PlanMapper.toEntity(createdPlan);
	}

	// -----------------------------
	// FIND BY ID
	// -----------------------------

	async findById(id) {

		const plan =
			await planModel.findById(id);

		return PlanMapper.toEntity(plan);
	}

	// -----------------------------
	// FIND BY NAME
	// -----------------------------

	async findByName(name) {

		const plan =
			await planModel.findOne({ name });

		return PlanMapper.toEntity(plan);
	}

	// -----------------------------
	// FIND BY ACCOUNT TYPE
	// -----------------------------

	async findByAccountType(accountType) {

		const plans =
			await planModel.find({ accountType });

		return plans.map(PlanMapper.toEntity);
	}

	// -----------------------------
	// FIND ALL
	// -----------------------------

	async findAll(filters = {}) {

		const query = {};
		const sort = {};

		// -----------------------------
		// FILTERS
		// -----------------------------

		if (filters.serviceType) {
			query.serviceType =
				filters.serviceType;
		}

		if (filters.accountType) {
			query.accountType =
				filters.accountType;
		}

		if (filters.status) {
			query.status =
				filters.status;
		}

		// -----------------------------
		// SORTING
		// -----------------------------

		if (filters.sort === "price_asc") {
			sort.price = 1;
		}

		if (filters.sort === "price_desc") {
			sort.price = -1;
		}

		// -----------------------------
		// PAGINATION
		// -----------------------------

		const page =
			Number(filters.page) || 1;

		const limit =
			Number(filters.limit) || 10;

		const skip =
			(page - 1) * limit;

		// -----------------------------
		// QUERY
		// -----------------------------

		const [plans, total] =
			await Promise.all([

				planModel
					.find(query)
					.sort(sort)
					.skip(skip)
					.limit(limit),

				planModel.countDocuments(query)
			]);

		return {
			data: plans.map(
				PlanMapper.toEntity
			),

			pagination: {
				total,
				page,
				limit,
				totalPages:
					Math.ceil(total / limit)
			}
		};
	}

	// -----------------------------
	// UPDATE
	// -----------------------------

	async update(id, updateData) {

		const updatedPlan =
			await planModel.findByIdAndUpdate(
				id,
				updateData,
				{ new: true }
			);

		return PlanMapper.toEntity(updatedPlan);
	}

	// -----------------------------
	// DELETE
	// -----------------------------

	async delete(id) {

		const deletedPlan =
			await planModel.findByIdAndDelete(id);

		return PlanMapper.toEntity(deletedPlan);
	}
}