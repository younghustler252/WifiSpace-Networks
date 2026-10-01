import { API } from "@/lib/api/api-client";

export const dashboardApi = {
	staff: () => API.get<Record<string, unknown>>("/dashboard/staff"),
	admin: () => API.get<Record<string, unknown>>("/dashboard/admin"),
};