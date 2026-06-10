import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export const useAdminDashboard = () => {
	return useQuery({
		queryKey: ["admin-dashboard"],
		queryFn: async () => {
			const res = await dashboardApi.getAdminDashboard();
			return res.data;
		},

		// 👇 important dashboard optimizations
		staleTime: 60 * 1000, // 1 min fresh
		gcTime: 10 * 60 * 1000, // keep cache 10 min

		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};

export const useStaffDashboard = () => {
	return useQuery({
		queryKey: ["staff-dashboard"],
		queryFn: async () => {
			const res = await dashboardApi.getStaffDashboard();
			return res.data;
		},

		staleTime: 60 * 1000,
		gcTime: 10 * 60 * 1000,

		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};