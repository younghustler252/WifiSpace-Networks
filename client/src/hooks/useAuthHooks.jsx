import { useMutation, useQuery } from "@tanstack/react-query";
import { login, registerUser, googleAuth, getProfile, logout } from "../services/authService";

// Login Hook
export const useLogin = () => {
    return useMutation({
        mutationFn: login,
    });
};

// Register Hook
export const useRegister = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};

// Google Login Hook
export const useGoogleAuth = () => {
    return useMutation({
        mutationFn: googleAuth,
    });
};

// Get Profile Hook
export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: false,
        enabled: !!localStorage.getItem("token"), // only fetch if logged in
    });
};

// Logout Hook
export const useLogout = () => {
    return () => logout();
};
