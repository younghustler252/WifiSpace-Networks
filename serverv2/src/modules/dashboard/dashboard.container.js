import { asClass } from "awilix";

import { GetAdminDashboardUseCase } from "./usecases/get-admin-dashboard.js";
import { GetStaffDashboardUseCase } from "./usecases/get-staff-dashboard.js";

import { DashboardController } from "./controllers/dashboard.controller.js";

export function registerDashboard(container) {
    
    container.register({
        getAdminDashboard: asClass(GetAdminDashboardUseCase).scoped(),
        getStaffDashboard: asClass(GetStaffDashboardUseCase).scoped(),

    })

    container.register({
        dashboardController: asClass(DashboardController).scoped(),

    })
}
