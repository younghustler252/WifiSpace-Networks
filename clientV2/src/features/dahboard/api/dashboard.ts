import { API } from "@/lib/api/client";
import { ApiResponse } from "@/lib/api/types";
import { DashboardStats } from "../dashboard.types";

export const dashboardApi = {
	// -----------------------------
	// ADMIN DASHBOARD
	// -----------------------------
	getAdminDashboard: (): Promise<ApiResponse<DashboardStats>> =>
		API.get("/dashboard/admin"),

	// -----------------------------
	// STAFF DASHBOARD
	// -----------------------------
	getStaffDashboard: (): Promise<ApiResponse<DashboardStats>> =>
		API.get("/dashboard/staff"),
};