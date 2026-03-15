import planModel from "../database/moongoose/plan.model.js";
import { PlanRepository } from "../../domain/plan.repository.js";

export class PlanRepositoryMongo extends PlanRepository {

	async create(planData) {
		return await planModel.create(planData);
	}

	async findById(id) {
		return await planModel.findById(id);
	}

	async findByName(name) {
		return await planModel.findOne({ name });
	}

	async findByType(type) {
		return await planModel.find({ type });
	}

	async findAll(filters = {}) {

		const query = {};
		const sort = {};

		if (filters.type) {
			query.type = filters.type;
		}

		if (filters.status) {
			query.status = filters.status;
		}

		if (filters.sort === "price_asc") {
			sort.price = 1;
		}

		if (filters.sort === "price_desc") {
			sort.price = -1;
		}

		return await planModel
			.find(query)
			.sort(sort);
	}

	async update(id, updateData) {
		return await planModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);
	}

	async delete(id) {
		return await planModel.findByIdAndDelete(id);
	}

}