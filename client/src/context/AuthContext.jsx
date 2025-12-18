import { useState, useEffect, createContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService, logout as logoutService, getProfile } from "../services/authService";
import { ROUTE } from "../Routes/Route";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	// Fetch user profile if token exists
	useEffect(() => {
		let isMounted = true;

		const fetchUser = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const profile = await getProfile();
					if (isMounted) setUser(profile);
				} catch (err) {
					console.error("Failed to load profile:", err);
					logoutService();
					if (isMounted) setUser(null);
				}
			}
			if (isMounted) setLoading(false);
		};

		fetchUser();

		return () => {
			isMounted = false;
		};
	}, []);

	// Login function with role-based navigation
	const login = useCallback(async (credentials) => {
		try {
			setLoading(true);
			setError(null);
			const data = await loginService(credentials);
			setUser(data.user);

			// Redirect automatically based on role
			if (data.user.role === "admin") navigate(ROUTE.adminDashboard);
			else navigate(ROUTE.dashboard);

			return data.user;
		} catch (err) {
			const message = err?.message || "Login failed";
			setError(message);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	// Logout function
	const logout = useCallback(async () => {
		logoutService();
		setUser(null);
		navigate(ROUTE.login);
	}, [navigate]);

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				loading,
				error,
				isAuthenticated: !loading && !!user
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
