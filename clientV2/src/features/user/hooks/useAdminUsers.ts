import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";
import { useAuth } from "@/context/AuthContext";

type SortOrder = "az" | "za" | "newest" | "oldest";

type Role = "customer" | "staff" | "superadmin";

export function useAdminUsers(params: {
	search?: string;
	role?: string;
	status?: string;
	sort: SortOrder;
	page: number;
	limit: number;
}) {
	return useQuery({
		queryKey: [
			"admin-users",
			params.search,
			params.role,
			params.status,
			params.sort,
			params.page,
			params.limit,
		],
		queryFn: () =>
			userApi.getAllUsers({
				search: params.search || undefined,
				role: params.role || undefined,
				status: params.status || undefined,
				sort: params.sort,
				skip: (params.page - 1) * params.limit,
				limit: params.limit,
			}),
		placeholderData: (prev) => prev,
		staleTime: 30_000,
		refetchInterval: 10_000,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: userApi.createUser,

		retry: 1,

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});
}
export function useUpdateUserProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: any;
		}) => userApi.updateUserProfile(id, data),

		onMutate: async (vars) => {
			await queryClient.cancelQueries({ queryKey: ["admin-users"] });

			return vars;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});
}

export function useUpdateUserRole() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	return useMutation({
		mutationFn: (data: { userId: string; role: string }) => {
			// 🔐 safety guard (extra layer beyond UI)
			if (user?.role !== "superadmin") {
				throw new Error("Unauthorized");
			}

			return userApi.updateUserRole(data);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});
}

export function useBanUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => userApi.banUser(id),

		retry: 0,

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});
}


export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => userApi.deleteUser(id),

		retry: 0,

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});
}