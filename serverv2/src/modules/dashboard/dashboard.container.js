// modules/dashboard/dashboard.container.js
import { asClass } from "awilix";
import { GetAdminDashboard } from "./usecases/get-admin-dashboard.usecase.js";
import { GetStaffDashboard } from "./usecases/get-staff-dashboard.usecase.js";
import { DashboardController } from "./controllers/dashboard.controller.js";

export function registerDashboard(container) {
	container.register({
		getAdminDashboard: asClass(GetAdminDashboard).scoped(),
		getStaffDashboard: asClass(GetStaffDashboard).scoped(),
		dashboardController: asClass(DashboardController).scoped()
	});
}