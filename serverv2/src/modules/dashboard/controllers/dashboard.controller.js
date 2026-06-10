import { successResponse } from "../../../shared/utils/api-response.js";

export class DashboardController {
    constructor({
        getAdminDashboard,
        getStaffDashboard,
    }) {
        this.getAdminDashboard = getAdminDashboard;
        this.getStaffDashboard = getStaffDashboard;
    }

    getAdminDashboardHandler = async (req, res, next) => {
        try {
            const dashboard = await this.getAdminDashboard.execute();

            return successResponse({
                res,
                data: dashboard,
                message: "Admin dashboard fetched successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getStaffDashboardHandler = async (req, res, next) => {
        try {
            const dashboard = await this.getStaffDashboard.execute();

           return successResponse({
                res,
                data: dashboard,
                message: "Staff dashboard fetched successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}