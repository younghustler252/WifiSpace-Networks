import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getDashboardData,
    createSubscription,
    getMikrotikProfiles,
    updateSubscription,
    deleteSubscription,
    getAllUsers,
    createUser as createUserApi,
    getUserById,
    deleteUserById,
    updateUserById,
    assignSubscriptionToUser,
    getUserByWsn,
    searchUsers,
    banUser,
} from "../services/adminService";

// ------------------------------------------------------------
// 1️⃣ Dashboard Data
// ------------------------------------------------------------
export const useAdminDashboardData = () => {
    return useQuery({
        queryKey: ["adminDashboard"],
        queryFn: getDashboardData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

// ------------------------------------------------------------
// 2️⃣ Subscriptions (Admin)
// ------------------------------------------------------------
export const useCreateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSubscription,
        onSuccess: () => queryClient.invalidateQueries(["adminSubscriptions"]),
    });
};

export const useMikrotikProfiles = () => {
    return useQuery({
        queryKey: ["mikrotikProfiles"],
        queryFn: getMikrotikProfiles,
       staleTime: 1000 * 60 * 60, // 1 hour (considered "fresh")
		cacheTime: 1000 * 60 * 60 * 6, // keep in cache for 6 hours
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }) => updateSubscription(id, updates),
        onSuccess: () => queryClient.invalidateQueries(["adminSubscriptions"]),
    });
};
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUserApi,
        onSuccess: () => {
            // Invalidate queries that need to be refreshed after user creation
            queryClient.invalidateQueries(["adminUsers"]);
        },
        onError: (error) => {
            // Optionally, you can handle the error here (like showing a toast)
            console.error("Error creating user: ", error);
        },
    });
};

export const useDeleteSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSubscription,
        onSuccess: () => queryClient.invalidateQueries(["adminSubscriptions"]),
    });
};

// ------------------------------------------------------------
// 3️⃣ Users (Admin)
// ------------------------------------------------------------
export const useAllUsers = (
  filters = {},
  sort = "",
  page = 1,
  limit = 10,
  options = {}
) => {
  return useQuery({
    queryKey: ["adminUsers", filters, sort, page, limit],
    queryFn: () => getAllUsers(filters, sort, page, limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  });
};



export const useUserById = (id) => {
    return useQuery({
        queryKey: ["adminUser", id],
        queryFn: () => getUserById(id),
        enabled: !!id,
    });
};

export const useUserByWsn = (wsnId) => {
    return useQuery({
        queryKey: ["adminUserWsn", wsnId],
        queryFn: () => getUserByWsn(wsnId),
        enabled: !!wsnId,
    });
};

export const useSearchUsers = (query) => {
    return useQuery({
        queryKey: ["adminUserSearch", query],
        queryFn: () => searchUsers(query),
        enabled: !!query,
    });
};

export const useBanUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ban }) => banUser(id, ban),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]);
        },
    });
};


// ------------------------------------------------------------
// 2️⃣ Delete User
// ------------------------------------------------------------
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUserById,
        onSuccess: () => {
            // Invalidate user list so UI updates
            queryClient.invalidateQueries(["users"]);
        },
    });
};

// ------------------------------------------------------------
// 3️⃣ Update User
// ------------------------------------------------------------
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, updateData }) => updateUserById(userId, updateData),
        onSuccess: (_, { userId }) => {
            // Refetch user info after update
            queryClient.invalidateQueries(["adminUsers"]);       // user list
            queryClient.invalidateQueries(["adminUser", userId]); // single user
        },
    });
};


// ------------------------------------------------------------
// 4️⃣ Assign / Activate Subscription
// ------------------------------------------------------------
export const useAssignSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, subscriptionData }) => assignSubscriptionToUser(userId, subscriptionData),
        onSuccess: (_, { userId }) => {
            // Refetch user info after subscription assignment
            queryClient.invalidateQueries(["users"]);
            queryClient.invalidateQueries(["user", userId]);
        },
    });
};