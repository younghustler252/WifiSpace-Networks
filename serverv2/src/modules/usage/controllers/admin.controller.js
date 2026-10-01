// controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ getUsageStats, getAllUsage }) {
		this.getUsageStatsUseCase = getUsageStats;
		this.getAllUsageUseCase = getAllUsage;
	}
	getUsageStats = async (req, res) => {
		const summary = await this.getUsageStatsUseCase.execute({ subscriptionId: req.params.subscriptionId });
		return successResponse({ res, data: summary?.toJSON() ?? null, message: "Usage stats fetched successfully" });
	};
	getAllUsage = async (req, res) => {
		const { data, meta } = await this.getAllUsageUseCase.execute({ subscriptionId: req.params.subscriptionId, ...req.query });
		return paginatedResponse({ res, data: data.map((u) => u.toJSON()), meta, message: "Usage history fetched successfully" });
	};
}