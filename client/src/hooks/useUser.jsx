import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, updateUserDetails, updateSubscription, changePassword } from "../services/userService";

export const useUser = () => {
    const queryClient = useQueryClient();

    //-----------------------------------
    // GET DASHBOARD DATA
    //-----------------------------------
    const dashboard = useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboardData,
        staleTime: 5 * 60 * 1000, // 5 minutes caching
        retry: 1, // retry once on failure
    });

    //-----------------------------------
    // MUTATIONS
    //-----------------------------------

    // Update user details — optimistic
    const updateDetails = useMutation({
        mutationFn: updateUserDetails,
        onMutate: async (updates) => {
            await queryClient.cancelQueries(["dashboard"]);
            const previous = queryClient.getQueryData(["dashboard"]);
            queryClient.setQueryData(["dashboard"], (old) => ({
                ...old,
                profile: { ...old.profile, ...updates },
            }));
            return { previous };
        },

        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["dashboard"], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(["dashboard"]);
        },

    });

    // Update subscription plan
    const updateUserSubscription = useMutation({
        mutationFn: updateSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries(["dashboard"]);
        },
    });

    // Change password (no optimistic update needed)
    const passwordChange = useMutation({
        mutationFn: ({ oldPassword, newPassword }) => changePassword(oldPassword, newPassword),
    });

    //-----------------------------------
    // RETURN EVERYTHING CLEANLY
    //-----------------------------------
    return {
        // QUERY
        dashboard,

        // MUTATIONS
        updateDetails,
        updateUserSubscription,
        passwordChange,
    };
};
