// modules/dashboard/controllers/dashboard.controller.js
import { successResponse } from "../../../shared/utils/api-response.js";

export class DashboardController {
	constructor({ getAdminDashboard, getStaffDashboard }) {
		this.getAdminDashboardUseCase = getAdminDashboard;
		this.getStaffDashboardUseCase = getStaffDashboard;
	}

	getAdminDashboard = async (req, res) => {
		const stats = await this.getAdminDashboardUseCase.execute();
		return successResponse({ res, data: stats, message: "Dashboard stats fetched successfully" });
	};

	getStaffDashboard = async (req, res) => {
		const stats = await this.getStaffDashboardUseCase.execute();
		return successResponse({ res, data: stats, message: "Dashboard stats fetched successfully" });
	};
}